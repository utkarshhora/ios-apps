import coremltools

caffe_model = ('EmotiW_VGG_S.caffemodel', 'deploy.prototxt')
labels = 'emotions.txt'

coreml_model = coremltools.converters.caffe.convert(

    caffe_model,
    image_input_names = 'data',
    class_labels = labels
)

coreml_model.save('EmotionsClassifier.mlmodel')
