void function () {
  /**
   * utils
   */
  var utils = {}

  utils.getBase64FromImageUrl = function (url, onSuccess) {
    var img = new Image()
    img.setAttribute('crossOrigin', 'anonymous')
    img.onload = function () {
      var canvas = document.createElement('canvas')
      canvas.width = this.width
      canvas.height = this.height
      var ctx = canvas.getContext('2d')
      ctx.drawImage(this, 0, 0)
      var dataURL = canvas.toDataURL('image/png')
      onSuccess && onSuccess(dataURL, canvas)
    }
    img.src = url
  }

  utils.setImageBackground = function ($target, url) {
    var urlString = 'url(' + url + ')'
    $target.style.backgroundImage = urlString
  }

  /**
   * canvasFilters
   */
  var canvasFilters = {}

  // TODO: Support config & image recognition
  canvasFilters.dottify = function (source, options) {
    var w = source.width
    var h = source.height

    var sourceCanvas = document.createElement('canvas')
    var sourceCtx = sourceCanvas.getContext('2d')
    sourceCanvas.width = w
    sourceCanvas.height = h
    sourceCtx.putImageData(source, 0, 0)

    var filteredCanvas = document.createElement('canvas')
    var filteredCtx = filteredCanvas.getContext('2d')
    filteredCanvas.width = w
    filteredCanvas.height = h

    var step = 4
    var xPoints = w / step
    var yPoints = h / step
    for(var i = 0; i <= xPoints; i++){
      for(var j = 0; j <= yPoints; j++){
        var x = i * step
        var y = j * step
        var data = sourceCtx.getImageData(x, y, 1, 1).data
        var color = 'rgb(' + data[0] + ',' + data[1] + ',' + data[2] + ')'
        filteredCtx.fillStyle = color
        filteredCtx.fillRect(x, y, 1, 1)
      }
    }

    var filtered = filteredCtx.getImageData(0, 0, source.width, source.height)
    return filtered
  }

  canvasFilters.grayscale = function (source, options) {
    var filtered = new ImageData(source.width, source.height)
    var filteredData = filtered.data
    var sourceData = source.data
    for (var i = 0; i < sourceData.length; i+=4) {
      var r = sourceData[i]
      var g = sourceData[i+1]
      var b = sourceData[i+2]
      var v = 0.3*r + 0.59*g + 0.11*b
      filteredData[i] = filteredData[i+1] = filteredData[i+2] = v
      filteredData[i+3] = sourceData[i+3]
    }
    return filtered
  }

  canvasFilters.contrast = function (source, options) {
    var adjust = 40
    adjust = Math.pow((adjust + 100) / 100, 2)
    var filtered = new ImageData(source.width, source.height)
    var filteredData = filtered.data
    var sourceData = source.data
    for (var i = 0; i < sourceData.length; i+=4) {
      var r = sourceData[i]
      var g = sourceData[i+1]
      var b = sourceData[i+2]
      filteredData[i] = (((r / 255) - 0.5) * adjust + 0.5) * 255
      filteredData[i+1] = (((g / 255) - 0.5) * adjust + 0.5) * 255
      filteredData[i+2] = (((b / 255) - 0.5) * adjust + 0.5) * 255
      filteredData[i+3] = sourceData[i+3]
    }
    return filtered
  }

  canvasFilters.brightness = function (source, options) {
    var adjust = 40
    adjust = Math.floor(255 * (adjust / 100))
    var filtered = new ImageData(source.width, source.height)
    var filteredData = filtered.data
    var sourceData = source.data
    for (var i = 0; i < sourceData.length; i+=4) {
      var r = sourceData[i]
      var g = sourceData[i+1]
      var b = sourceData[i+2]
      filteredData[i] = r + adjust
      filteredData[i+1] = g + adjust
      filteredData[i+2] = b + adjust
      filteredData[i+3] = sourceData[i+3]
    }
    return filtered
  }

  /**
   * DotsTrump Class
   */
  var DotsTrump = function () {
    this.source = null // ImageData
    this.filtered = null
  }

  DotsTrump.prototype.src = function (source) {
    this.source = source
    this.filtered = source
    return this
  }

  DotsTrump.prototype.pipe = function (task, options) {
    if (typeof task !== 'function') return this
    this.filtered = task(this.filtered, options)
    return this
  }

  DotsTrump.prototype.value = function () {
    return this.filtered
  }

  var dotsTrump = new DotsTrump()

  /**
   * Project Class
   */
  var Project = function () {
    this.initialize()
  }

  Project.prototype.initialize = function () {
    this.$sourceImage = document.querySelector('.source-image')
    this.$filteredImage = document.querySelector('.filtered-image')
    this.$uploadImageBtn = document.querySelector('.upload-image')
    this.$downloadImageBtn = document.querySelector('.download-image')

    this.config = { // Static
      defaultImagePath: '../../_assets/brown-bear.jpg'
    }

    this.states = { // Dynamic
      imageName: null,
      sourceImage: null,
      filteredImage: null,
      filterOptions: {
        grayscale: 100,
        dotscale: 50
      },
    }

    this.mount()
  }

  Project.prototype.mount = function () {
    this.mountDefaultImage()
    this.mountImageUploader()
    this.mountImageDownloader()
  }

  Project.prototype.updateStates = function (key, value, isSilent) {
    this.states[key] = value
    if (isSilent) return
    switch (key) {
      case 'sourceImage':
        utils.setImageBackground(this.$sourceImage, value)
        this.sourceToFilteredImage()
        break
      case 'filteredImage':
        utils.setImageBackground(this.$filteredImage, value)
        break
    }
  }

  Project.prototype.mountDefaultImage = function () {
    var self = this
    utils.getBase64FromImageUrl(this.config.defaultImagePath, function (dataURL) {
      var imageName = self.config.defaultImagePath.split('/')
      imageName = imageName.pop().replace(/\.(.*)?$/, '')
      self.updateStates('imageName', imageName)
      self.updateStates('sourceImage', dataURL)
    })
  }

  Project.prototype.mountImageUploader = function () {
    var input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/png,image/gif,image/jpeg')
    input.setAttribute('style', 'display: none;')

    this.$uploadImageBtn.appendChild(input)
    this.$uploadImageBtn.addEventListener('click', function () { input.click() }, false)
    input.addEventListener('change', this.onUploadNewImage.bind(this), false)
  }

  Project.prototype.mountImageDownloader = function () {
    this.$downloadImageBtn.addEventListener('click', this.onDownloadFilteredImage.bind(this), false)
  }

  Project.prototype.sourceToFilteredImage = function () {
    var self = this
    utils.getBase64FromImageUrl(this.states.sourceImage, function (url, canvas) {
      var sourceImageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height)
      var filteredImageData = dotsTrump
        .src(sourceImageData)
        .pipe(canvasFilters.grayscale, self.states.filterOptions)
        .pipe(canvasFilters.contrast, self.states.filterOptions)
        .pipe(canvasFilters.brightness, self.states.filterOptions)
        .pipe(canvasFilters.dottify, self.states.filterOptions)
        .value()
      canvas.getContext('2d').putImageData(filteredImageData, 0, 0)
      var filteredImage = canvas.toDataURL('image/png')
      self.updateStates('filteredImage', filteredImage)
    })
  }

  Project.prototype.onUploadNewImage = function (event) {
    var self = this
    var files = event.target.files
    for (var i = 0; i < files.length; i++) {
      var file = files[i]
      var reader = new window.FileReader()
      if (!file) return
      reader.onload = function () {
        self.updateStates('imageName', file.name)
        self.updateStates('sourceImage', window.URL.createObjectURL(file))
      }
      reader.readAsDataURL(file)
    }
  }

  Project.prototype.onDownloadFilteredImage = function () {
    var link = document.createElement('a')
    link.download = '[Dottify] ' + this.states.imageName
    link.href = this.states.filteredImage
    link.click()
  }

  var project = new Project()
}()
