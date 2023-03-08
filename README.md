# ET Hub

## dev

### Starting the backend server
`python python/hub_server/main.py`
or
`rez env hub_server -- hub_server`

### Starting up npm dev server

Navigate to `et_hub/hub_ui/source`
`npm run start`

### Starting electron for dev

Navigate to `et_hub/hub_ui/source`
`npm run electron`

## On first checkout

### clone the project

```bash
git clone git@gitlab.etc.com:george/et_hub.git
```

### setup development environment

setup the commit message

```bash
cd et_hub
git config commit.template ci/commit-msg-template
```

setup your dev virtual env and dev tooling. We install these packages in a virtual env to avoid polluting your system packages.

```bash
# create virtual env
cd et_hub
python3 -m venv env

# install dev tools
source env/bin/activate
(env) pip install -r requirements_dev.txt
(env) pre-commit install
```

The pre-commit hooks will run the following tests on your code before getting to commit message:

- Validate that there is no trailing white spaces.
- Make sure that there are no merge conflicts left and any files.
- Verify that the Json and Yaml files are formatted correctly.
- Run a flake8 with our settings against the file.

### Installing node dependencies

Navigate to `et_hub/hub_ui/source`
`npm install`

### Building for dev

Only `hub_server` should be built, use `inv devbuild` at its root.
