/// Copyright Chris Doty 2023.  MIT License

let tenUtilOptions = {
};

class tenUtil {
  //setup
  constructor(){
    if(! tenUtil.instance){
      tenUtil.instance = this;
      this.replacement={};
    }
    return tenUtil.instance;
  }

  different(hash1,hash2) {
    let changed = false;
    if((hash1!==undefined && hash2===undefined)||(hash1===undefined && hash2!==undefined)) return true;
    if(hash1===undefined && hash2===undefined) return false;
    if(hash1.length!==hash2.length) return true;
    for (const key2 in hash2){
      let value2=hash2[key2];
      if(changed) return;
      let first = (key2+'').substring(0,1);
      if(first==='$' || first==='_') return;
      if (!(value2 === '' && hash1[key2] === undefined)) {
        let typ = Object.prototype.toString.call(value2);
        if (typ === '[object Object]' || typ === '[object Array]') {
          if (this.different(value2, hash1[key2])) {
            changed = true;
          }
        } else if ((value2 + '') !== ('' + hash1[key2])) {
          changed = true;
        }
      }
    }

    return changed;
  }

  // common utility functions
  changed($scope,item,idx) {
    let changed = false;

    let checkItem = function(value,key) {
      if(changed || value===undefined) return;
      if(this.different(value,$scope[key])) {
        changed = true;
      }
    };

    if(!item) {
      for (const key in $scope.change){
        checkItem($scope.change[key], key);
      }
    } else {
      if($scope.change) {
        if(idx!==undefined) {
          changed = this.different($scope.change[item][idx],$scope[item][idx]);
        } else {
          changed = this.different($scope.change[item],$scope[item]);
        }
      }
    }
    return changed;
  }

  // directive parameters
  trueFalse(model,name, def) {
    let value = def;
    if(model && model[name] !== undefined) { value = model[name]; }
    if(value === undefined) value = def;
    value = value==="1" || value==="Y" || value==="true" || value===1 || value===true;
    model[name] = value;
    return value;
  }

  // object/array manipulation
  copy(from,to,all) {
    let typ=Object.prototype.toString.call( from );
    if(typ === '[object Array]') {
      to = to || [];
      for(let i=0;i<from.length;i++) {
        to[i]=this.copy(from[i],false,all);
      }
    } else
    if(typ === '[object Object]') {
      to = to || {};
      for (const key in from){
        if(all || (key.indexOf!==undefined && key.indexOf('_')!==0 && key.indexOf('$')!==0)) {
          to[key]=this.copy(from[key],false,all);
        }
      }
    } else return from;

    return to;
  }
  clear(to,all) {
    if(Object.prototype.toString.call( to ) === '[object Array]') {
      to.length=0;
      return to;
    }

    // remove all value that do not start with an underline
    for (const key in to){
      if(all || (key.indexOf!==undefined && key.indexOf('_')!==0 && key.indexOf('$')!==0))
        delete to[key];
    }
    return to;
  }
  clearExtend(to,from,all) {
    this.clear(to,all);

    if(Object.prototype.toString.call( to ) === '[object Array]') {
      for(let i=0;i<from.length;i++) {
        if (Object.prototype.toString.call(from[i]) === '[object Object]') {
          to.push(this.clearExtend({}, from[i]));
        } else {
          to.push(from[i]);
        }
      }
      return to;
    }

    if(from!==undefined) this.extend(to,from);
    return to;
  }
  union(to, from, all) {
    let typ=Object.prototype.toString.call( to );
    if(typ === '[object Array]') {
      for(let i=0;i<from.length;i++) {
        to.push(from[i]);
      }
      return to;
    }
    for (let key in from){
      if(all || key.indexOf!==undefined && key.indexOf('_')!==0 && key.indexOf('$')!==0) {
        if(to[key]===undefined)
          to[key]= from[key];
      }
    }
    return to;
  }
  overwrite(to, from, all) {
    for (const key in from) {
      if(!from.hasOwnProperty(key)) continue;
      let value = from[key];

      if(all || (key.indexOf!==undefined && key.indexOf('_')!==0 && key.indexOf('$')!==0)) {
        to[key]=value;
      }
    }
    return to;
  }
  extend(to, from){
    if(Array.isArray(from)){
      let fromArgs = [...arguments];
      fromArgs.splice(0, 1);
      for(let i=0; i < fromArgs.length; i++){
        this.overwrite(to, fromArgs[i], true);
      }
      return to;
    }else{
      return this.overwrite(to, from, true);
    }
  }

  // fields
  properCase(txt) {
    if(!txt) return '';
    return txt.substr(0,1).toUpperCase()+txt.substr(1);
  }

  // clipboard
  fallbackCopyTextToClipboard(text) {
    let textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      let successful = document.execCommand('copy');
      let msg = successful ? 'successful' : 'unsuccessful';
      console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
  }
  copyTextToClipboard(text) {
    if (!navigator.clipboard) {
      this.fallbackCopyTextToClipboard(text);
      return;
    }
    navigator.clipboard.writeText(text).then(function() {
      console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
      console.error('Async: Could not copy text: ', err);
    });
  }

  // macros
  macroReplace(str, values){
    if (values === undefined) return str;
    let typ = Object.prototype.toString.call(str);

    if (typ === '[object String]'){
      let keys = str.match(/\{+(\w*)}+/g);
      if (keys === undefined || keys===null) return str;

      for (let i = 0; i < keys.length; i++){
        var key = keys[i];
        let name = key.replace(/[{}]/g, '');
        if (name === undefined || name === '') continue;

        if (values[name] === undefined) continue;
        let re = new RegExp('\\{' + name + '\\}', 'g');
        str = str.replace(re, values[name]);
      }
      return str;
    }
    if (typ === '[object Object]' || typ === '[object Array]'){
      for (let i = 0; i < str.length; i++){
        str[i] = this.macroReplace(str[i], values);
      }
    }
    return str;
  }
  addReplacementHash(hash) {
    if(this.replacement.indexOf(hash)>=0) return this;
    this.replacement.push(hash);
    return this;
  }
  getReplacementHash(replacement) {
    let hashes = {};
    if(replacement) this.union(hashes,replacement);
    for(let i=0;i<this.replacement.length;i++) {
      this.union(hashes,this.replacement[i]);
    }
    return hashes;
  }
}

const instance = new tenUtil();

export default instance;