from __future__ import print_function
import os
import re
import subprocess

e = ".*PackageFamilyNotFoundError|PackageNotFoundError.*found: ([\w]+)"
NOTFOUND = re.compile(e)


def find_root(path):
    while path != "" and not path == "/":
        parent = os.path.dirname(path)
        package_file = os.path.join(parent, "package.py")
        if os.path.exists(package_file):
            return os.path.dirname(path)
        path = parent


def filter_packages(files):
    packages = [find_root(_file) for _file in files]
    packages = set(filter(None, packages))
    return list(packages)


def find_internal_packages(files):
    return filter_packages(files)


def process_files(cmd):
    proc = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        shell=True,
        universal_newlines=True,
    )
    out, err = proc.communicate()
    _files = []
    for line in out.split("\n"):
        if line:
            _files.append(os.path.normpath(line.rstrip()))
    return _files


def process_until_empty(cmd, packages):
    packages_not_build = len(packages)
    packages_build = set()
    packages.sort()
    while packages:
        ignore = False
        current_not_build = packages_not_build
        for path in packages:
            proc = subprocess.Popen(
                "cd {0}; {1}".format(path, cmd),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                shell=True,
                universal_newlines=True,
            )
            stdout, stderr = proc.communicate()
            if not proc.returncode:
                print(path, "Success")
                packages_not_build -= 1
                packages.remove(path)
                version = open(os.path.join(path, "VERSION")).read().strip()
                packages_build.add(os.path.join(path, version))
            else:
                print(stdout)
                print(stderr)
                missing_packages = NOTFOUND.findall(stderr)
                if missing_packages:
                    for p in missing_packages:
                        if p not in packages:
                            packages.append(p)
                            packages_not_build += 1
                    ignore = True

        if current_not_build == packages_not_build and not ignore:
            return False, list(packages_build)
    return True, list(packages_build)
