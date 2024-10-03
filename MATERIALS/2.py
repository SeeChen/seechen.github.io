from PIL import Image
import pillow_avif

JPGimg = Image.open('20200901-01' + '.jpg')
JPGimg.save('20200901-01' + '.avif','AVIF', exif=None)