packages_path = [
    "/tmp/$CI_JOB_ID",
    "/software/rez/packages/projects/PROJECT_NAME",
    "/software/rez/packages/projects/global",
    "/software/rez/packages/int",  # internally developed pkgs, deployed
    "/software/rez/packages/benchmark",  # internally developed pkgs,
    "/software/rez/packages/centos_7",
    "/software/rez/packages/ext",  # external pkgs, build from source by us
    "/software/rez/packages/egg",  # external pypi packages
    "/software/rez/packages/vendor",  # external pkgs, like houdini
]

release_packages_path = "/software/rez/packages/int"

local_packages_path = "/tmp/$CI_JOB_ID"
