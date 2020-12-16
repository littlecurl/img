var evt = new CustomEvent('included', {
	bubbles: true,
	cancelable: false
})
;(function (window, document){
	var Include = function (){}
	Include.prototype = {
		forEach: function (array, callback){
			var size = array.length
			for (var i = size - 1; i >= 0; i -= 1) {
				callback.apply(array[i], [ i ])
			}
		},
		getFilePath: function (){
			var curWwwPath = window.document.location.href
			var pathName = window.document.location.pathname
			var localhostPaht = curWwwPath.substring(0, curWwwPath.indexOf(pathName))
			var projectName = pathName.substring(0, pathName.substr(1).lastIndexOf('/') + 1)
			return localhostPaht + projectName
		},
		getFileContent: function (url){
			var ie = navigator.userAgent.indexOf('MSIE') > 0
			var o = ie ? new ActiveXObject('Microsoft.XMLHTTP') : new XMLHttpRequest()
			o.open('get', url, false)
			o.send(null)
			return o.responseText
		},
		parseNode: function (content){
			var objE = document.createElement('div')
			objE.innerHTML = content
			return objE.childNodes
		},
		executeScript: function (content){
			var mac = /<script>([\s\S]*?)<\/script>/g
			var r = ''
			while ((r = mac.exec(content))) {
				eval(r[1])
			}
		},
		getHtml: function (content){
			var mac = /<script>([\s\S]*?)<\/script>/g
			content.replace(mac, '')
			return content
		},
		getPrevCount: function (src){
			var mac = /\.\.\//g
			var count = 0
			while (mac.exec(src)) {
				count += 1
			}
			return count
		},
		getRequestUrl: function (filePath, src){
			if (/http:\/\//g.test(src)) {
				return src
			}
			var prevCount = this.getPrevCount(src)
			while (prevCount--) {
				filePath = filePath.substring(0, filePath.substr(1).lastIndexOf('/') + 1)
			}
			return filePath + '/' + src.replace(/\.\.\//g, '')
		},
		replaceIncludeElements: function (){
			var $this = this
			var filePath = $this.getFilePath()
			var includeTals = document.getElementsByTagName('include')
			this.forEach(includeTals, function (){
				var src = this.getAttribute('src')
				var content = $this.getFileContent($this.getRequestUrl(filePath, src))
				var parent = this.parentNode
				var includeNodes = $this.parseNode($this.getHtml(content))
				var size = includeNodes.length
				for (var i = 0; i < size; i += 1) {
					parent.insertBefore(includeNodes[0], this)
				}
				$this.executeScript(content)
				parent.removeChild(this)
			})
		}
	}
	window.onload = function (){
            new Include().replaceIncludeElements()
            
            document.dispatchEvent(evt);
	}
})(window, document)
