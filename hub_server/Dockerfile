FROM python:3.7.11
ARG UID
ARG GID

ENV PYTHONUNBUFFERED 1

RUN apt-get update && apt-get install -y sudo && apt-get clean all && \
    adduser --uid $UID --gid $GID --disabled-password --gecos "" george && \
    echo 'george ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers

RUN apt-get install -y python3.9 python3.9-venv
RUN python3 -m pip install --upgrade pip

WORKDIR /opt/hub_server
RUN chmod 777 /opt/hub_server
USER george

ENV VIRTUAL_ENV=/opt/hub_server/venv
RUN python3.9 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY source/ .

CMD ["./bin/hub_server"]
