import cv2

# 读取图像
image = cv2.imread('home-background.jpg')

# 进行高斯模糊处理，(15, 15) 是高斯核的大小，0 表示根据图像自动计算标准差
gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
blurred_image = cv2.GaussianBlur(gray_image, (55, 55), 0)

# 显示原始图像和模糊后的图像
cv2.imshow('Original Image', image)
cv2.imshow('Blurred Image', blurred_image)

cv2.imwrite('new_image.jpg', blurred_image)

# 等待键盘事件然后关闭窗口
cv2.waitKey(0)
cv2.destroyAllWindows()
