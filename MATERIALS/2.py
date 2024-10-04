from PIL import Image
import pillow_avif

JPGimg = Image.open('convert' + '.jpg')
JPGimg.save('convert' + '.avif','AVIF', exif=None)