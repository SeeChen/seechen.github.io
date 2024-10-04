
from PIL import Image
import json
import piexif
from PIL import Image
import pillow_avif

def convert_to_degrees(value):
    d = float(value[0][0]) / float(value[0][1])
    m = float(value[1][0]) / float(value[1][1])
    s = float(value[2][0]) / float(value[2][1])

    return d + (m / 60.0) + (s / 3600.0)

all_img = []
for _i in range(1, 14):

    with Image.open(f'{_i}.jpg') as img:

        img_w = img.size[0]
        img_h = img.size[1]
        
        exif_data = piexif.load(img.info['exif'])
        gps_info = exif_data['GPS']

        if gps_info:
            gps_latitude = gps_info[piexif.GPSIFD.GPSLatitude]
            gps_latitude_ref = gps_info[piexif.GPSIFD.GPSLatitudeRef].decode()
            gps_longitude = gps_info[piexif.GPSIFD.GPSLongitude]
            gps_longitude_ref = gps_info[piexif.GPSIFD.GPSLongitudeRef].decode()

            latitude = convert_to_degrees(gps_latitude)
            longitude = convert_to_degrees(gps_longitude)

            if gps_latitude_ref != "N":
                latitude = -latitude
            if gps_longitude_ref != "E":
                longitude = -longitude

            img_lati = latitude
            img_long = longitude
        else:

            img_lati = 0
            img_long = 0

        need_tag = [
            'DateTimeDigitized',
            'Flash',
            'FocalLengthIn35mmFilm',
            'Make',
            'Model',
            'FNumber',
            'ExposureTime',
            'ISOSpeedRatings',
            'ExposureBiasValue',
            'OffsetTime'
        ]

        for ifd in exif_data:
            for tag in exif_data[ifd]:
                try:
                    tag_name = piexif.TAGS[ifd][tag]["name"]
                    tag_value = exif_data[ifd][tag]
                except:
                    continue

                if tag_name in need_tag:
                    if tag_name == 'DateTimeDigitized':
                        tag_value = tag_value.decode('utf-8')
                        img_taken = tag_value.split(' ')
                        img_date = img_taken[0].replace(':', '-')
                        img_time = img_taken[1]
                    
                    elif tag_name == 'Flash':
                        img_flash = tag_value

                    elif tag_name == 'FocalLengthIn35mmFilm':
                        img_focal_length = f'{tag_value}mm'

                    elif tag_name == 'Make':
                        tag_value = tag_value.decode('utf-8')
                        img_make = tag_value

                    elif tag_name == 'Model':
                        tag_value = tag_value.decode('utf-8')
                        img_model = tag_value

                    elif tag_name == 'FNumber':
                        img_f_stop = f'f/{tag_value[0] / tag_value[1]}'

                    elif tag_name == 'ExposureTime':
                        img_exposure_time = f'{tag_value[0]}/{tag_value[1]} sec.'

                    elif tag_name == 'ISOSpeedRatings':
                        img_iso = f'ISO-{tag_value}'

                    elif tag_name == 'ExposureBiasValue':
                        img_step = f'{tag_value[0] / tag_value[1]}'
                    
                    elif tag_name == 'OffsetTime':
                        tag_value = tag_value.decode('utf-8')
                        img_gmt = f'{tag_value}'

        img_name = f'{img_date.replace("-", "")}_{img_time.replace(":", "")}'
        img_current = {
            "name": f'{img_name}.avif',
            "width": img_w,
            "height": img_h,
            "latitude": img_long,
            "longitude": img_lati,
            "flash-mode": img_flash,
            "focal-length": img_focal_length,
            "camera-make": img_make,
            "camera-model": img_model,
            "f-stop": img_f_stop,
            "exposure-time": img_exposure_time,
            "iso-speed": img_iso,
            "exposure-step": img_step,
            "date": img_date,
            "time": img_time,
            "img-tag": ""
        }

        JPGimg = Image.open(f'{_i}.jpg')
        JPGimg.save(f'{img_name}.avif', 'AVIF', exif=None)

        all_img.append(img_current)

with open('output.json', 'w') as json_file:
    json.dump(all_img, json_file, indent=4)
