from PIL import Image
import pillow_avif

JPGimg = Image.open('home-background' + '.jpg')
JPGimg.save('home-background' + '.AVIF','AVIF', exif=None)