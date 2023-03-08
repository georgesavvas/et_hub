import logging


class LogFormatter(logging.Formatter):

    grey = "\x1b[38;21m"
    yellow = "\x1b[33;21m"
    red = "\x1b[31;21m"
    bold_red = "\x1b[31;1m"
    reset = "\x1b[0m"
    _format = "%(asctime)s - %(name)-8s - %(levelname)-8s - %(message)s"

    # FORMATS = {
    #     logging.DEBUG: grey + _format + reset,
    #     logging.INFO: grey + _format + reset,
    #     logging.WARNING: yellow + _format + reset,
    #     logging.ERROR: red + _format + reset,
    #     logging.CRITICAL: bold_red + _format + reset
    # }

    def format(self, record):
        # log_fmt = self.FORMATS.get(record.levelno)
        formatter = logging.Formatter("%(asctime)s - %(name)-8s - %(levelname)-8s - %(message)s", datefmt="%d/%m/%Y %H:%M:%S")
        return formatter.format(record)
