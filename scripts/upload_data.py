from pathlib import Path

import requests
import json
from enum import Enum

ROOT_PATH = Path(__file__).parent
DB_SERVICE_URL = (
    'http://localhost:8000/'
)


class InfoType(Enum):
    WORK_EXPERIENCE = 'work_experience'
    PERSONAL_PROJECT = 'personal_project'


def _get_infos(info_type: InfoType) -> list[dict]:
    with open(
        ROOT_PATH / info_type.value / f'{info_type.value}.json', 'r'
    ) as f:
        return json.load(f)


def _get_description(info_type: InfoType, description_file: str) -> str:
    with open(ROOT_PATH / info_type.value / description_file, 'r') as f:
        return f.read()


def process_info(info_type: InfoType) -> None:
    print(f'Processing {info_type.value.replace("_", " ")}s...')
    infos = _get_infos(info_type)
    for i, info in enumerate(infos):
        print(
            f'Processing {info_type.value.replace("_", " ")} '
            f'{i + 1}/{len(infos)}...'
        )
        description = _get_description(info_type, info['description_file'])
        info['description'] = description
        del info['description_file']
        resp = requests.post(
            DB_SERVICE_URL + info_type.value.replace('_', '-'),
            json=info,
        )
        resp.raise_for_status()
    print(f'Done processing {info_type.value.replace("_", " ")}s.')


def main():
    process_info(InfoType.WORK_EXPERIENCE)
    process_info(InfoType.PERSONAL_PROJECT)


if __name__ == '__main__':
    main()
