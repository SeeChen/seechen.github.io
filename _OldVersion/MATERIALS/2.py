from PIL import Image
import pillow_avif

for i in range(1):
	JPGimg = Image.open(str(i) + '.jpg')
	JPGimg.save(str(i) + '.avif','AVIF', exif=None)