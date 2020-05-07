import coremltools

caffe_model = ('oxford102.caffemodel', 'deploy.prototxt')
labels = 'flower-labels.txt'

coreml_model = coremltools.converters.caffe.convert(

    caffe_model,
    image_input_names = 'data',
    class_labels = labels
)

coreml_model.save('FlowerClassifier.mlmodel')
