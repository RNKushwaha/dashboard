var editor = ace.edit("editor");
    var theme = getCookie('theme');

    if (!theme) {
        theme = 'eclipse';
    }

    var font_size = getCookie('font_size');
    if (!font_size) {
        font_size = '14px';
    }

    var wrap_text = getCookie('wrap_text');
    if (wrap_text === false || wrap_text == 'false' || wrap_text == '') {
        wrap_text = false;
    } else {
        wrap_text = true;
    }

    var soft_tab = getCookie('soft_tab');
    if (soft_tab === false || soft_tab == 'false' || soft_tab == '') {
        soft_tab = false;
    } else {
        soft_tab = true;
    }

    var soft_tab_size = getCookie('soft_tab_size');
    if (!soft_tab_size) {
        soft_tab_size = 4;
    }

    var show_invisible = getCookie('show_invisible');
    if (show_invisible === false || show_invisible == 'false' || show_invisible == '') {
        show_invisible = false;
    } else {
        show_invisible = true;
    }

    var show_gutter = getCookie('show_gutter');
    if (show_gutter === false || show_gutter == 'false' || show_gutter == '') {
        show_gutter = false;
    } else {
        show_gutter = true;
    }

    var show_indent = getCookie('show_indent');
    if (show_indent === false || show_indent == 'false' || show_indent == '') {
        show_indent = false;
    } else {
        show_indent = true;
    }

    editor.session.setMode("ace/mode/php");
    editor.setTheme("ace/theme/" + theme);
    editor.setFontSize(font_size);
    editor.setShowInvisibles(show_invisible);
    editor.renderer.setShowGutter(show_gutter);
    editor.setDisplayIndentGuides(show_indent);
    editor.getSession().setUseWrapMode(wrap_text);
    editor.getSession().setUseSoftTabs(soft_tab);
    editor.getSession().setTabSize(soft_tab_size);
    editor.setShowPrintMargin(false);
    editor.setHighlightActiveLine(true);
    editor.gotoLine(3,4,true);
    editor.focus();

    function setUpOptions(){
        $$('theme').value = theme;
        $$('font_size').value = font_size;
        $$('show_invisible').value = show_invisible.toString();
        $$('show_gutter').value = show_gutter.toString();
        $$('show_indent').value = show_indent.toString();
        $$('wrap_text').value = wrap_text.toString();
        $$('soft_tab').value = soft_tab.toString();
        $$('soft_tab_size').value = soft_tab_size;
    }

    function setCookie(name, value, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    function eraseCookie(name) {
        document.cookie = name + '=; Max-Age=-99999999;';
    }

    function runCode(){
        var xhr = new XMLHttpRequest();
        xhr.open("POST", 'run.php', true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE ) {
                if (this.status == 200) {
                    get('prog.php', function(result){
                        $$('result-cont').innerHTML = result;
                    });
                } else {
                    alert('Status code '+this.status+' was returned');
                }
            }
        }
        xhr.send(new URLSearchParams(new FormData($$('ajaxForm'))).toString());
    }

    function post(url, data, callback){
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE ) {
                if (this.status == 200) {
                    callback(this.responseText);
                } else {
                    alert('Status code '+this.status+' was returned');
                }
            }
        }
        xhr.send(new URLSearchParams(data).toString());
    }

    function get(url, callback){
        var xhr = new XMLHttpRequest();
        xhr.open("GTE", url, true);
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE ) {
                if (this.status == 200) {
                    callback(this.responseText);
                } else {
                    alert('Status code '+this.status+' was returned');
                }
            }
        }
        xhr.send();
    }

    function runIt(e){
        let content = editor.session.getValue();
        $$('content').value = content;
        runCode();
        e.preventDefault();
    }

    function clearIt(e){
        setUpEditorInstance('<?php\n    // write your code here\n    ', 3, 4);
        editorSnapshot();
        e.preventDefault();
    }

    function setIt(){
        $$('settings').style.display = 'block';
    }

    function closeIt(){
        $$('settings').style.display = 'none';
    }

    function editorSnapshot(){
        const lastCode = {
          code: editor.getSession().getValue(),
          cursor: editor.getCursorPosition(),
          mode: editor.session.getMode().$id,
        }
        window.localStorage.setItem("code", JSON.stringify(lastCode));
    }

    function setUpEditorInstance(code, row, column){
        editor.session.setValue(code);
        editor.gotoLine(row, column, true);
        editor.focus();
    }

    var $$ = function(el){
        return document.getElementById(el);
    };

    $$('theme').addEventListener('change', function (event) {
        editor.setTheme("ace/theme/"+event.target.value);
        setCookie('theme',event.target.value,30);
    });

    $$('font_size').addEventListener('change', function (event) {
        editor.setFontSize(event.target.value);
        setCookie('font_size',event.target.value,30);
    });

    $$('wrap_text').addEventListener('change', function (event) {
        var wrapOption = (event.target.value == 'true' ? true : false);
        editor.getSession().setUseWrapMode(wrapOption);
        setCookie('wrap_text',wrapOption,30);
    });
    
    $$('show_invisible').addEventListener('change', function (event) {
        var show_invisible = (event.target.value == 'true' ? true : false);
        editor.setShowInvisibles(show_invisible);
        setCookie('show_invisible',show_invisible,30);
    });
    $$('show_gutter').addEventListener('change', function (event) {
        var show_gutter = (event.target.value == 'true' ? true : false);console.log(show_gutter);
        editor.renderer.setShowGutter(show_gutter);
        setCookie('show_gutter',show_gutter,30);
    });
    $$('show_indent').addEventListener('change', function (event) {
        var show_indent = (event.target.value == 'true' ? true : false);
        editor.setDisplayIndentGuides(show_indent);
        setCookie('show_indent',show_indent,30);
    });

    $$('soft_tab').addEventListener('change', function (event) {
        var softtabOption = (event.target.value == 'true' ? true : false);
        var softsizeOption = ($$('soft_tab_size').value >0 ? $$('soft_tab_size').value : 4);

        editor.getSession().setUseSoftTabs(softtabOption);
        editor.getSession().setTabSize(softsizeOption);
        setCookie('soft_tab',softtabOption,30);
        setCookie('soft_tab_size',softsizeOption,30);
    });
    $$('soft_tab_size').addEventListener('change', function (event) {
        var softsizeOption = (event.target.value > 0 ? event.target.value : 4);
        var softtabOption = ($$('soft_tab').value == 'true' ? true : false);

        editor.getSession().setUseSoftTabs(softtabOption);
        editor.getSession().setTabSize(softsizeOption);
        setCookie('soft_tab',softtabOption,30);
        setCookie('soft_tab_size',softsizeOption,30);
    });

    setUpOptions();
    
    editor.getSession().on('change', function() {
        editorSnapshot();
    });

    // load last edited code from localstorage
    var lastCode = window.localStorage.getItem("code");
    lastCode = JSON.parse(lastCode);

    if(lastCode){
        setUpEditorInstance(lastCode.code, lastCode.cursor.row+1, lastCode.cursor.column);
        editorSnapshot();
    } else{
        setUpEditorInstance('<?php\n    // write your code here\n    ', 3, 4);
    }

