(function (window, document) {
	"use strict";

	function isArray(arr) {
		return typeof arr === "object" && typeof arr.length === "number";
	}

	function isUndef(v) {
		var is = false;

		if (v === undefined) {
			is = true;
		}

		return is;
	}

	function undefVar(v, d) {
		if (typeof v === "undefined") {
			return d;
		}
		return v;
	}

	function findElem(sel, scope, makeArr) {
		makeArr = undefVar(makeArr, true); // return array or not
		scope = undefVar(scope, document);

		var seltype = sel.charAt(0);
		var name = sel.substring(1, sel.length);
		if (seltype == ".") {
			return scope.getElementsByClassName(name);
		} else if (seltype == "#") {
			var elem = scope.getElementById(name);
			return makeArr ? [elem] : elem;
		} else {
			return scope.getElementsByTagName(sel);
		}
	}
	
	
	function init() {
		function List(elems, sel, scope) {
			for (var i = 0; i < elems.length; i++) {
				this[i] = elems[i];
				if (typeof this[i].style !== 'undefined') {
					this[i].disp = this[i].style.display;
				} else {
					this[i].disp = ''
				}
			}
			this.length = elems.length || 0;
			this.selector = sel;
			this.erk = true;
			this.scope = scope;
		}
		
		List.prototype.map = function (callback) {
			var res = [], num;
			if (typeof callback === "undefined") {
				callback = function (elem) {
					return elem;
				};
			} else if (typeof callback === "number") {
				num = callback;
				callback = function (elem) {
					return elem;
				};
				for (var i = 0; i < this.length; i++) {
					res.push(callback.call(this, this[i], i));
				}
				return res[num];
			}
			for (var i = 0; i < this.length; i++) {
				res.push(callback.call(this, this[i], i));
			}
			return res;
		};

		List.prototype.forEach = function (callback) {
			this.map(callback)
			return this;
		}
		
		List.prototype.style = function (attr, val) {
			if (!isUndef(val)) {
				return this.forEach(function (elem) {
					elem[attr] = val;
				});
			} else {
				return this.map(function (elem) {
					return elem[attr]
				});
			}
		}
		function _attr(attr, title) {
			if (isUndef(title)) {
				title = attr;
			}
			
			List.prototype[title] = function (val) {
				if (isUndef(val)) {
					return this.map(function (elem) {
						return elem[attr]
					});
				}
				return this.forEach((elem) => elem[attr] = val);
			};
		}

		function _css(attr, title) {
			if (isUndef(title)) {
				title = attr
			}
			List.prototype[title] = function (val) {
				if (isUndef(val)) {
					return this.map((elem) => elem.style[attr]);
				}
				return this.forEach((elem) => elem.style[attr] = val);
			};

		}

		List.prototype.append = function (elems) {
			this.forEach(function (elemP, i) {
				elems.forEach(function (childElem) {
					if (i > 0) {
						childElem = childElem.cloneNode(true);
					}
					elemP.appendChild(childElem);
				});
			});
			return this;
		};
		List.prototype.copy = function (tf) {
			tf = typeof tf === "boolean" ? tf : false;
			return new List(this.map(function (elem) {
				return elem.cloneNode(tf);
			}), this.selector);
		};
		List.prototype.prepend = function (elems) {
			return this.forEach(function (elemP, i) {
				for (var e = elems.length - 1; e >= 0; e--) {
					var elem = (e > 0) ? elems[i].cloneNode(true) : elems[e];
					elemP.insertBefore(elem, elemP.childNodes[0]);
				}
			});
		};

		List.prototype.attr = function (attr, val) {
			if (typeof val !== "undefined") {
				return this.forEach(function (elem) {
					elem.setAttribute(attr, val);
				});
			} else {
				return this.map(function (elem) {
					return elem.getAttribute(attr);
				});
			}
		};

		List.prototype.delattr = function (attr) {
			return this.forEach(function(elem){
				elem.removeAttribute(attr)
			});
		}

		List.prototype.on = function (evt, callback) {
			if (evt.indexOf(' ') > 0) {
				for (let i = 0; i < evt.split(' ').length; i++) {
					const a = evt.split(' ')[i];
					this.on(a, callback)
				}
			}
			return this.forEach(function (elem) {
				elem.addEventListener(evt, function (evt) {
					callback(evt, new List([elem]))
				});
			});
		}

		List.prototype.off = function (evt, callback) {
			if (evt.index(' ') >= 0) {
				for (let i = 0; i < evt.split(' ').length; i++) {
					const a = evt.split(' ')[i];
					this.off(a, callback)
				}
			}
			return this.forEach(function (elem) {
				elem.removeEventListener(evt, callback);
			});
		};

		List.prototype.show = function (callback=()=>{}) {
			return this.forEach(function(elem, ti, i) {
				elem.style.display = elem.disp == 'none' ? 'block':elem.disp;
				callback(this, ti, i);
			});
		}

		List.prototype.hide = function (callback=()=>{}) {
			return this.forEach(function (elem, ti, i) {
				elem.style.display = 'none';
				callback(this, ti, i);
			});
		}

		List.prototype.toggle = function (callback) {
			return this.forEach(function(elem, ti, i) {
				if (elem.style.display == 'none') {
					_(elem).show()
				} else {
					elem.style.display = 'none';
				}
				callback(this, ti, i);
			});
		};
		
		List.prototype.removeClass = function (c) {
			this.forEach(function (elem) {
				var cn = elem.className.split(" "), i;
				while ((i = cn.indexOf(c)) > -1) {
					cn = cn.slice(0, i).concat((cn.slice(++i)));
				}
				elem.className = cn.join(" "); ""
			});
			return this;
		};

		List.prototype.addClass = function (c) {
			var cn = "";
			if (typeof c === "string") {
				cn += " " + c;
			} else {
				for (var cla = 0; cla < c.length; cla++) {
					cn += " " + c[cla];
				}
			}
			this.forEach(function (elem) {
				elem.className += cn;
			});
			return this;
		};

		//ATTRS:
		_attr('innerHTML', 'html') // change innerHTML
		_attr('innerText', 'text') // change Text
		_attr('value')
		_attr('id')
		_attr('src')

		_attr('className', 'classes')
		_attr('width')
		_attr('height')
		// CSS:
		_css('width','csswidth')
		_css('height','cssheight')
		_css('cursor')
		_css('backroundColor', 'bgcolor')
		_css('fontSize')
		_css('background', 'bg')
		_css('color')
		_css('transparency', 'transp')
		_css('visibility', 'visi')
		//Margins:
		_css('margin')
		_css('marginTop', 'margTop')
		_css('marginBotton', 'margBotton')
		_css('marginLeft', 'margLeft')
		_css('marginRight', 'margRight')
		//Paddings:
		_css('padding')
		_css('paddingTop', 'padTop')
		_css('paddingBotton', 'padBotton')
		_css('paddingLeft', 'padLeft')
		_css('paddingRight', 'padRight')


		function meths(__) {
			"use strict";
			__.assign = function (meth) {
				if (typeof meth === "object" && !isArray(meth)) {
					for (var key in meth) {
						__[key] = meth[key];
					}

				} else if (typeof meth === "string") {
					__[meth] == arguments[1];

				} else if (isArray(meth)) {
					for (var i = 0; i < meth.length; i++) {
						__.assign(meth[i]);
					}
				}
			}

			__.assign({
				all: function () {
					return __("*");
				},
				sel: function (sel, scope) {
					return findElem(sel, scope, false)
				},
				merge: function (arr1, arr2) {
					var res = [], args = arguments, i = 0;
					for (; i < arr2.length; i++) {
						if (!isArray(arr2)) {
							arr2 = [arr2];
						}
						arr1.push(arr2[i]);
					}
					if (args.length > 2) {
						for (var a = 2; a < args.length; a++) {
							if (!isArray(args[a])) {
								args[a] = [args[a]];
							}
							for (var e = 0; e < args[a].length; e++) {
								arr1.push(args[a][e]);
							}
						}
					}
					return arr1;
				},
				extend: function (overwrite, toBeExt) {
					var i = 2, args = arguments;
					for (; i < args.length; i++) {
						for (var o in args[i]) {
							if (overwrite) {
								toBeExt[o] = args[i][o];
							} else if (o in toBeExt) {
								continue;
							} else {
								toBeExt[o] = args[i][o];
							}
						}
					}
					return toBeExt;
				},
			});

			return __
		}
		var _ = function (sel, scope) {
			var elems;
			scope = undefVar(scope, document)
			if (typeof sel !== "undefined") {
				if (typeof sel === "string") {
					if (sel.charAt(0) == "<" && sel.charAt(sel.length - 1) == ">") {
						elems = [scope.createElement(sel.substring(1, sel.length - 1))]
					} else {
						elems = findElem(sel, scope);
					}
				} else if (sel.length) {
					elems = sel;
				} else {
					elems = [sel];
				}
				return new List(elems, sel, scope)
			} else {
				return this;
			}
		};
		meths(_); // Add methods to _
		return _
	}

	module.exports = init();
})(window, window.document);