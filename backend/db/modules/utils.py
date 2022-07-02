import os


def get_service_mode():
    return os.environ.get('SERVICE_MODE', 'local')