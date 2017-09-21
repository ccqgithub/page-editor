import 'ContentTools/build/content-tools';
import ossUploader from './oss-uploader';

import 'ContentTools/build/content-tools.min.css';
import '../style/themes/formatted.css';
import '../style/themes/formatted-sm.css';
import '../style/themes/formatted-lg.css';

let ContentTools = window.ContentTools;
let ContentEdit = window.ContentEdit;

ContentTools.IMAGE_UPLOADER = ossUploader;
ContentTools.StylePalette.add([
  new ContentTools.Style('Footer', 'footer', ['p']),
  new ContentTools.Style('ClearFloat', 'clear-float', ['p']),
  new ContentTools.Style('StayLeft', 'stay-left', ['img'])
]);

// 解决保留空白行的问题
ContentEdit.TRIM_WHITESPACE = false;
ContentEdit.Text.prototype.blur = function() {
  if (this.isMounted()) {
    this._syncContent();
  }
  if (this.content.isWhitespace() && this.can('remove')) {
    // if (this.parent()) {
    //   this.parent().detach(this);
    // }
  } else if (this.isMounted()) {
    if (!document.documentMode && !/Edge/.test(navigator.userAgent)) {
      this._domElement.blur();
    }
    this._domElement.removeAttribute('contenteditable');
  }
  return ContentEdit.Text.__super__.blur.call(this);
};

ContentEdit.Text.prototype._keyReturn = function(ev) {
  var element, insertAt, lineBreakStr, selection, tail, tip;
  ev.preventDefault();
  selection = ContentSelect.Range.query(this._domElement);
  tip = this.content.substring(0, selection.get()[0]);
  tail = this.content.substring(selection.get()[1]);
  if (ev.shiftKey ^ ContentEdit.PREFER_LINE_BREAKS) {
    insertAt = selection.get()[0];
    lineBreakStr = '<br>';
    if (this.content.length() === insertAt) {
      if (this.content.length() === 0 || !this.content.characters[insertAt - 1].isTag('br')) {
        lineBreakStr = '<br><br>';
      }
    }
    this.content = this.content.insert(insertAt, new HTMLString.String(lineBreakStr, true), true);
    this.updateInnerHTML();
    insertAt += 1;
    selection = new ContentSelect.Range(insertAt, insertAt);
    selection.select(this.domElement());
    this.taint();
    return;
  }
  if (!this.can('spawn')) {
    return;
  }
  this.content = tip.trim();
  this.updateInnerHTML();
  element = new this.constructor('p', {}, tail.trim());
  this.parent().attach(element, this.parent().children.indexOf(this) + 1);
  if (tip.length() || !tail.length()) {
    element.focus();
    selection = new ContentSelect.Range(0, 0);
    selection.select(element.domElement());
  } else {
    selection = new ContentSelect.Range(0, tip.length());
    selection.select(this._domElement);
  }
  return this.taint();
};

ContentEdit.Image.prototype.mount = function() {
  var classes, style;

  this._domElement = document.createElement('div');

  // class
  classes = '';
  if (this.a && this.a['class']) {
    classes += ' ' + this.a['class'];
  }
  if (this._attributes['class']) {
    classes += ' ' + this._attributes['class'];
  }
  this._domElement.setAttribute('class', classes);

  // style
  style = this._attributes['style'] ? this._attributes['style'] : '';
  if (this._attributes['width']) {
    style += "width:" + this._attributes['width'] + "px;";
  }
  style += "height:auto;";
  this._domElement.setAttribute('style', style);

  // img
  var $img = document.createElement('img');
  $img.src = this._attributes['src'];
  this._domElement.appendChild($img);

  return ContentEdit.Image.__super__.mount.call(this);
}

export default ContentTools;
