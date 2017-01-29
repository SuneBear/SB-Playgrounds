void function () {

  const SBDEV = {}

  // Enviroment
  SBDEV.ENV = location.host.indexOf('localhost') >= 0 ? 'development' : 'production'

  // Debug
  SBDEV.DEBUG = SBDEV.ENV === 'development'
  window.DEBUG = SBDEV.DEBUG

  // Mount to window
  if (DEBUG) window.SBDEV = SBDEV

}()
