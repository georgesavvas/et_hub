#!/usr/bin/env python
from __future__ import print_function
from builtins import input
import os
import sys
import time
import glob
import subprocess
import json

from os.path import dirname, join, abspath

try:
    from invoke import ctask as task
except ImportError:
    from invoke import task

from invoke import run, Collection

sys.path.append(join(dirname(__file__), 'ci'))

import ci_utils


@task(
    help={
        "origin_branch": "The source branch to with we check for file changes. (defaults to main)",
        "branch": "The branch we want to find the changes files for. (defaults to current)",
    }
)
def changed_files_in_branch(ctx, origin_branch="main", branch=None):
    """Show a list of all files that are changes in the branch."""

    files = changed_files(origin_branch=origin_branch, branch=branch)

    if not files:
        return

    print("=== Files Changes ===")
    for l in files:
        print(l)


@task(
    help={
        "origin_branch": "The source branch to with we check for package changes. (defaults to main)",
        "branch": "The branch we want to find the changes packages for. (defaults to current)",
    }
)
def changed_packages_in_branch(ctx, origin_branch="main", branch=None):
    """Show a list of all packages that are changes in the branch."""

    files = changed_files(origin_branch=origin_branch, branch=branch)
    packages = git_root_filter_files(files)

    print("=== Packages Changes ===")
    packages.sort()
    for l in packages:
        print(l)


@task
def build_clean(ctx):
    """Clean build folders from packages."""

    for dirs, fold, files in os.walk("."):
        if "package.py" in files:
            subprocess.Popen(
                "cd {0};inv clean &".format(dirs), shell=True, universal_newlines=True,
            )


@task(help={"parallel": "try and build the packages in parallel. (faster)"})
def build_changed_packages(ctx, parallel=False, cache=True, clean=False):
    """Build all packages changed files in them."""

    cur = os.getcwd()
    files = git_status_changed()
    packages = [join(cur, _file) for _file in files]

    if cache:
        compile_files = compile_cache(packages)
    else:
        compile_files = packages

    packages = ci_utils.filter_packages(compile_files)
    build_packages(packages, parallel=parallel, clean=clean)


@task()
def build_all_packages(ctx):
    """Build all packages."""

    root = get_root()
    files = glob.glob(os.path.join(root, '*', 'package.py'))
    packages = ci_utils.filter_packages(files)
    build_packages(packages)


@task(
    help={
        "origin_branch": "The source branch to with we check against for changes. (defaults to main)",
        "branch": "The branch we want build changed packages from. (defaults to current)",
        "parallel": "try and build the packages in parallel. (faster but can't handle dependencies)",
        "clean": "remove existing local build if the exists first",
        "dev": "build packages in devbuild",
    }
)
def build_changed_packages_in_branch(
    ctx, origin_branch="main", branch=None, parallel=False, clean=False, dev=False
):
    """Build all packages that have changed in this branch compared to a original branch."""

    files = changed_files(origin_branch=origin_branch, branch=branch)
    packages = git_root_filter_files(files)
    build_packages(packages, parallel=parallel, clean=clean, dev=dev)


@task(
    help={
        "origin_branch": "The source branch to with we check against for changes. (defaults to main)",
        "branch": "The branch we want release packages from. (defaults to current)",
    }
)
def release_packages_in_branch(ctx, origin_branch="main", branch=None, extra=""):
    """Release all packages that are changes in the branch."""

    if os.geteuid() != 0:
        print("please run this command as root using sudo")
        sys.exit(1)

    files = changed_files(origin_branch=origin_branch, branch=branch)
    packages = git_root_filter_files(files)

    print("=== Packages to Release ===")
    packages.sort()
    for l in packages:
        print(l)

    if query_yes_no('do you wish to continue?'):
        print("=== Packages Releasing ===")

        cmd = "inv release"
        if extra:
            cmd += " --extra='{0}'".format(extra)

        completed = ci_utils.process_until_empty(cmd, packages)
        if not completed:
            print("there might be a issues and some packages can never be released")


####################################


def git_root_filter_files(files):
    root = get_root()
    packages = [join(root, _file) for _file in files]
    packages = ci_utils.filter_packages(packages)

    if not packages:
        sys.exit(1)

    return packages


def changed_files(origin_branch="main", branch=None):

    if not branch:
        branch = run_out("git rev-parse --abbrev-ref HEAD")

    cmd = "git diff --name-only {0} $(git merge-base {0} {1})".format(
        branch, origin_branch
    )
    return run_out_list(cmd)


def build_packages(packages, parallel=False, clean=False, dev=False):
    if not packages:
        return

    build = "cbuild" if clean else "build"

    if dev:
        build = "devbuild"

    print("==============")
    print("about to build", ",".join(packages))
    print("==============")

    if parallel:
        for path in packages:
            subprocess.Popen(
                "cd {0};inv {1} &".format(path, build),
                shell=True,
                universal_newlines=True,
            )
    else:
        with Timer("building package"):
            completed = ci_utils.process_until_empty("inv " + build, packages)
            if not completed:
                print("there might be a issues and some packages can never be released")


def git_status_changed():
    out = run_out("git status -s")
    files = []
    for line in out.split("\n"):
        lline = line.split()
        if len(lline) == 2:
            if lline[0] in ['M', '??']:
                files.append(lline[-1])
    return files


def run_out(cmd):
    return run(cmd, hide='both').stdout.rstrip()


def run_out_list(cmd):
    return [s.rstrip() for s in run_out(cmd).split('\n') if s.rstrip()]


def get_root():
    return run_out("git rev-parse --show-toplevel")


def compile_cache(packages):
    build_cache = '/tmp/.pipe.build.cache'
    if os.path.exists(build_cache):
        with open(build_cache) as e:
            cache_db = json.loads(e.read())
    else:
        cache_db = {}
    compile_files = []
    for file in packages:
        if not os.path.exists(file):
            continue
        size = os.path.getsize(file)
        mtime = os.path.getmtime(file)
        if file in cache_db:
            if cache_db[file]['size'] != size or cache_db[file]['mtime'] != mtime:
                cache_db[file]['size'] = size
                cache_db[file]['mtime'] = mtime
                compile_files.append(file)
        else:
            cache_db[file] = {'size': size, 'mtime': mtime}
            compile_files.append(file)
    with open(build_cache, 'w') as e:
        e.write(json.dumps(cache_db))
    return compile_files


class Timer(object):
    """
    Context manager that helps with timing.

    This class when used with the with statement allows you to print
    out the amount of time it took to perform the operation.
    """

    def __init__(self, name):
        self.name = name

    def __enter__(self):
        self.start = time.time()
        return self

    def __exit__(self, type, value, traceback):
        print(
            '{timer} finished took {elapsed} seconds'.format(
                timer=self.name, elapsed=time.time() - self.start
            ).strip()
        )

        return False


def query_yes_no(question, default="yes"):
    """Ask a yes/no question via raw_input() and return their answer.

    "question" is a string that is presented to the user.
    "default" is the presumed answer if the user just hits <Enter>.
        It must be "yes" (the default), "no" or None (meaning
        an answer is required of the user).

    The "answer" return value is True for "yes" or False for "no".
    """
    valid = {"yes": True, "y": True, "ye": True, "no": False, "n": False}
    if default is None:
        prompt = " [y/n] "
    elif default == "yes":
        prompt = " [Y/n] "
    elif default == "no":
        prompt = " [y/N] "
    else:
        raise ValueError("invalid default answer: '%s'" % default)

    while True:
        sys.stdout.write(question + prompt)
        choice = input().lower()
        if default is not None and choice == '':
            return valid[default]
        elif choice in valid:
            return valid[choice]
        else:
            sys.stdout.write("Please respond with 'yes' or 'no' " "(or 'y' or 'n').\n")


# setup pyinvoke collections

ns = Collection()

lists = Collection('list')
lists.add_task(changed_files_in_branch, 'files')
lists.add_task(changed_packages_in_branch, 'packages')

build = Collection('build')
build.add_task(build_clean, 'clean')
build.add_task(build_changed_packages, 'changed')
build.add_task(build_changed_packages_in_branch, 'branch')
build.add_task(build_all_packages, 'all')

release = Collection('release')
release.add_task(release_packages_in_branch, 'branch')

ns.add_collection(lists)
ns.add_collection(build)
ns.add_collection(release)
