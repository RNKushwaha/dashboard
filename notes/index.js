let note, timeout;
let db = new Dexie('Notes');
let viewType = 1; // 1- category, 0 - notes
let catId = null;

db.version(2).stores({
    notes: "++id,title,status,updated_at,category_id",
});

let catdb = new Dexie('Category');

catdb.version(2).stores({
    category: "++id,title,status,updated_at"
});

let contentUpdated = true;

var editor = initFroala();

function initFroala(){
    return new FroalaEditor("#note", {
        enter: FroalaEditor.ENTER_P,
        events: {
            'contentChanged': function (inputEvent) {
              if (timeout) clearTimeout(timeout);
                contentUpdated = true;
                timeout = setTimeout(addNote, 100);
            },
            'image.beforeUpload': function (files) {
                const editorObj = this;
                if (files.length) {
                  let reader = new FileReader();
                  reader.onload = function (e) {
                    editorObj.image.insert(e.target.result, null, null, editorObj.image.get());
                  }
                  reader.readAsDataURL(files[0]);
                }
                return false;
            }
        },
        toolbarButtons: 
            ['undo', 'redo', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', 'textColor', 'backgroundColor', 'inlineClass', 'inlineStyle', 'clearFormatting','alignLeft', 'alignCenter', 'alignRight', 'alignJustify', 'formatOL', 'formatUL', 'paragraphFormat', 'paragraphStyle', 'lineHeight', 'outdent', 'indent', 'quote','insertLink', 'emoticons', 'specialCharacters', 'insertImage', 'insertVideo', 'insertTable', 'embedly', 'insertFile', 'insertFiles', 'print', 'getPDF', 'insertHR', 'fullscreen', 'spellChecker', 'selectAll', 'html', 'help']
        ,
        attribution: false,
        fileAllowedTypes: ['application/pdf', 'application/msword', 'text/plain'],
        fileMaxSize: 1024 * 1024 * 3,
        autofocus: true,
        heightMax: 500,
        heightMin: 200,
        width: 1000,
    });
}

window.addEventListener('load', function() {
    note = getElement('note');
    refreshCategories();
});

function getElement(el){
    return document.getElementById(el);
}

function showElement(el){
    getElement(el).style.display = '';
}

function hideElement(el){
    getElement(el).style.display = 'none';
}

function attr(el, name, val){
    el.setAttribute(name, val);
}

function formatDate(dateTime){
    return dateTime.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).replace(/\./g, '-');
}

function safeName(filename, ext){
    let name = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
     name = name.replace(/__+/g, '_');
     name = name.replace(/_*$/, "");
    return name+'.'+ext;
}

function download(filename, text) {
    let fileExtension = filename.split('.').pop();
    let type, data;
    if(fileExtension == 'txt'){
        type = 'text/plain;';
        data = encodeURIComponent(text);
    } else if(fileExtension == 'json'){
        type = 'text/json;';
        data = encodeURIComponent(JSON.stringify(text));
    } else if(fileExtension == 'html'){
        type = 'text/html;';
        data = encodeURIComponent(text);
    }

    var el = document.createElement('a');
    attr(el, 'href', `data:${type}charset=utf-8, ${data}`);
    attr(el, 'download', filename);

    el.style.display = 'none';
    document.body.appendChild(el);

    el.click();
    document.body.removeChild(el);
}

function getNoteHtml(title, txt){
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    <style>.clearfix::after{clear:both;display:block;content:"";height:0}.hide-by-clipping{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0, 0, 0, 0);border:0}img.fr-rounded,.fr-img-caption.fr-rounded img{border-radius:10px;-moz-border-radius:10px;-webkit-border-radius:10px;-moz-background-clip:padding;-webkit-background-clip:padding-box;background-clip:padding-box}img.fr-bordered,.fr-img-caption.fr-bordered img{border:solid 5px #CCC}img.fr-bordered{-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box}.fr-img-caption.fr-bordered img{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box}.fr-view{word-wrap:break-word}.fr-view span[style~="color:"] a{color:inherit}.fr-view strong{font-weight:700}.fr-view table{border:none;border-collapse:collapse;empty-cells:show;max-width:100%}.fr-view table td{min-width:5px}.fr-view table.fr-dashed-borders td,.fr-view table.fr-dashed-borders th{border-style:dashed}.fr-view table.fr-alternate-rows tbody tr:nth-child(2n){background:whitesmoke}.fr-view table td,.fr-view table th{border:1px solid #DDD}.fr-view table td:empty,.fr-view table th:empty{height:20px}.fr-view table td.fr-highlighted,.fr-view table th.fr-highlighted{border:1px double red}.fr-view table td.fr-thick,.fr-view table th.fr-thick{border-width:2px}.fr-view table th{background:#ececec}.fr-view hr{clear:both;user-select:none;-o-user-select:none;-moz-user-select:none;-khtml-user-select:none;-webkit-user-select:none;-ms-user-select:none;break-after:always;page-break-after:always}.fr-view .fr-file{position:relative}.fr-view .fr-file::after{position:relative;content:"\\1F4CE";font-weight:normal}.fr-view pre{white-space:pre-wrap;word-wrap:break-word;overflow:visible}.fr-view[dir="rtl"] blockquote{border-left:none;border-right:solid 2px #5E35B1;margin-right:0;padding-right:5px;padding-left:0}.fr-view[dir="rtl"] blockquote blockquote{border-color:#00BCD4}.fr-view[dir="rtl"] blockquote blockquote blockquote{border-color:#43A047}.fr-view blockquote{border-left:solid 2px #5E35B1;margin-left:0;padding-left:5px;color:#5E35B1}.fr-view blockquote blockquote{border-color:#00BCD4;color:#00BCD4}.fr-view blockquote blockquote blockquote{border-color:#43A047;color:#43A047}.fr-view span.fr-emoticon{font-weight:normal;font-family:"Apple Color Emoji","Segoe UI Emoji","NotoColorEmoji","Segoe UI Symbol","Android Emoji","EmojiSymbols";display:inline;line-height:0}.fr-view span.fr-emoticon.fr-emoticon-img{background-repeat:no-repeat !important;font-size:inherit;height:1em;width:1em;min-height:20px;min-width:20px;display:inline-block;margin:-.1em .1em .1em;line-height:1;vertical-align:middle}.fr-view .fr-text-gray{color:#AAA !important}.fr-view .fr-text-bordered{border-top:solid 1px #222;border-bottom:solid 1px #222;padding:10px 0}.fr-view .fr-text-spaced{letter-spacing:1px}.fr-view .fr-text-uppercase{text-transform:uppercase}.fr-view .fr-class-highlighted{background-color:#ffff00}.fr-view .fr-class-code{border-color:#cccccc;border-radius:2px;-moz-border-radius:2px;-webkit-border-radius:2px;-moz-background-clip:padding;-webkit-background-clip:padding-box;background-clip:padding-box;background:#f5f5f5;padding:10px;font-family:"Courier New", Courier, monospace}.fr-view .fr-class-transparency{opacity:0.5}.fr-view img{position:relative;max-width:100%}.fr-view img.fr-dib{margin:5px auto;display:block;float:none;vertical-align:top}.fr-view img.fr-dib.fr-fil{margin-left:0;text-align:left}.fr-view img.fr-dib.fr-fir{margin-right:0;text-align:right}.fr-view img.fr-dii{display:inline-block;float:none;vertical-align:bottom;margin-left:5px;margin-right:5px;max-width:calc(100% - (2 * 5px))}.fr-view img.fr-dii.fr-fil{float:left;margin:5px 5px 5px 0;max-width:calc(100% - 5px)}.fr-view img.fr-dii.fr-fir{float:right;margin:5px 0 5px 5px;max-width:calc(100% - 5px)}.fr-view span.fr-img-caption{position:relative;max-width:100%}.fr-view span.fr-img-caption.fr-dib{margin:5px auto;display:block;float:none;vertical-align:top}.fr-view span.fr-img-caption.fr-dib.fr-fil{margin-left:0;text-align:left}.fr-view span.fr-img-caption.fr-dib.fr-fir{margin-right:0;text-align:right}.fr-view span.fr-img-caption.fr-dii{display:inline-block;float:none;vertical-align:bottom;margin-left:5px;margin-right:5px;max-width:calc(100% - (2 * 5px))}.fr-view span.fr-img-caption.fr-dii.fr-fil{float:left;margin:5px 5px 5px 0;max-width:calc(100% - 5px)}.fr-view span.fr-img-caption.fr-dii.fr-fir{float:right;margin:5px 0 5px 5px;max-width:calc(100% - 5px)}.fr-view .fr-video{text-align:center;position:relative}.fr-view .fr-video.fr-rv{padding-bottom:56.25%;padding-top:30px;height:0;overflow:hidden}.fr-view .fr-video.fr-rv>iframe,.fr-view .fr-video.fr-rv object,.fr-view .fr-video.fr-rv embed{position:absolute !important;top:0;left:0;width:100%;height:100%}.fr-view .fr-video>*{-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;max-width:100%;border:none}.fr-view .fr-video.fr-dvb{display:block;clear:both}.fr-view .fr-video.fr-dvb.fr-fvl{text-align:left}.fr-view .fr-video.fr-dvb.fr-fvr{text-align:right}.fr-view .fr-video.fr-dvi{display:inline-block}.fr-view .fr-video.fr-dvi.fr-fvl{float:left}.fr-view .fr-video.fr-dvi.fr-fvr{float:right}.fr-view a.fr-strong{font-weight:700}.fr-view a.fr-green{color:green}.fr-view .fr-img-caption{text-align:center}.fr-view .fr-img-caption .fr-img-wrap{padding:0;margin:auto;text-align:center;width:100%}.fr-view .fr-img-caption .fr-img-wrap img{display:block;margin:auto;width:100%}.fr-view .fr-img-caption .fr-img-wrap>span{margin:auto;display:block;padding:5px 5px 10px;font-size:14px;font-weight:initial;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;-webkit-opacity:0.9;-moz-opacity:0.9;opacity:0.9;-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";width:100%;text-align:center}.fr-view button.fr-rounded,.fr-view input.fr-rounded,.fr-view textarea.fr-rounded{border-radius:10px;-moz-border-radius:10px;-webkit-border-radius:10px;-moz-background-clip:padding;-webkit-background-clip:padding-box;background-clip:padding-box}.fr-view button.fr-large,.fr-view input.fr-large,.fr-view textarea.fr-large{font-size:24px}a.fr-view.fr-strong{font-weight:700}a.fr-view.fr-green{color:green}img.fr-view{position:relative;max-width:100%}img.fr-view.fr-dib{margin:5px auto;display:block;float:none;vertical-align:top}img.fr-view.fr-dib.fr-fil{margin-left:0;text-align:left}img.fr-view.fr-dib.fr-fir{margin-right:0;text-align:right}img.fr-view.fr-dii{display:inline-block;float:none;vertical-align:bottom;margin-left:5px;margin-right:5px;max-width:calc(100% - (2 * 5px))}img.fr-view.fr-dii.fr-fil{float:left;margin:5px 5px 5px 0;max-width:calc(100% - 5px)}img.fr-view.fr-dii.fr-fir{float:right;margin:5px 0 5px 5px;max-width:calc(100% - 5px)}span.fr-img-caption.fr-view{position:relative;max-width:100%}span.fr-img-caption.fr-view.fr-dib{margin:5px auto;display:block;float:none;vertical-align:top}span.fr-img-caption.fr-view.fr-dib.fr-fil{margin-left:0;text-align:left}span.fr-img-caption.fr-view.fr-dib.fr-fir{margin-right:0;text-align:right}span.fr-img-caption.fr-view.fr-dii{display:inline-block;float:none;vertical-align:bottom;margin-left:5px;margin-right:5px;max-width:calc(100% - (2 * 5px))}span.fr-img-caption.fr-view.fr-dii.fr-fil{float:left;margin:5px 5px 5px 0;max-width:calc(100% - 5px)}span.fr-img-caption.fr-view.fr-dii.fr-fir{float:right;margin:5px 0 5px 5px;max-width:calc(100% - 5px)}</style>
    </head><body class="fr-view">${txt}</body></html>`;
}

function getSidebar(isNotes, notes, deleted){
    let noteTitle = 'Category';
    let noteTitles = 'Categories';
    let vabtm = 'va-btm';
    if(isNotes == 1){
        noteTitle = 'Note';
        noteTitles = 'Notes';
        vabtm = '';
    }

    let deleteImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABGklEQVQ4T+2SP0rFQBDGZ7KoELCwEa+xf9KYMwS9hK2IgmJlbKw09h7C4ukVUgg7u+dQ0EZIIXFHNrwnMS952Ni51bfzzf7mY1iEwZFSXgPAUZIkom+FED6FEJW19rRfxxFAm6bpVl3X730vz/PNpmnevPdrSwClVMXMh8OpQ/jiHtMg4o1z7qxLIKUcnToFmKd59d6vLwAfQoirqQdjdWY+J6KNDqCUKhBxhoiXv4Ew8wUzF865x+8laq2ZiFBrfYyIbK29jToCiajSWp8AQOyJuuuN3hLAGFNGw1pbTul/gC3/fAczZg5EtG+MGdVTCV4AoCCip1WfKcuy3bZt7733Oz/+gTFmj5nvAGB7FSCE8IyIB865h9j3BYnlByBE1WgdAAAAAElFTkSuQmCC';
    let viewNoteImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAABVklEQVQ4T+3Uv0vWURQG8I9auCSUQyqFQU1BgxAtLoLSH6AYIg4uIYjQXIQFReIqOAjipGBaSnOQrS/kILSJBUE/F1tysCjkxHkdLl9w0NGzXLjnnOec+zwPt8EJR8MJ4zkFPGS0DXdwG11oRxO+YQuvsYofpQYlh1fxGMM4iy94irf857sXk+jAHyzjCT7UgeuA0fwQ99GcyY/ortgiwGrozLp9TONZDAnAK3iBW8X6/XiVT72Lf1jIcwjPi/p3QVMA7uBahR/PYQ/3MJP5cczhPH5W9GwH4CZuViRb8AsTmM38GOZxAbsVPbUAbMU6eoqCUPklGjGaT13McwRLRf0bDNZFOYNHKUoIFPEpRflaNF5OUS7l/e8UJET5W9rmetpgIDcLn01hI23Thwe4GM1YSxttl7Yp6QhLhJLhuxsIo0d8x/scsILPRxn72J/P6W9zbAodAHYnP+RlhrnUAAAAAElFTkSuQmCC';
    let donwloadImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAABnElEQVQ4T82UsUtdMRTGz0myWVDeVEeHQofq4mih9U/o2NpBipTy4OQZFTq8oamCU3mXnAw6CL5REP8al46Fih0KV/dnEolwH9er8C7llTbTzcmXX76PnBuEKQ+cMg/+HZCZv2mtdyYlau3Qez8kovX/A+ic2xFCvKjchBCOpJQbAPAdAJ7nekppBhF3iei87vpBZO/9Ykrpo9aa6sJm5MFg0FFKHZdl+cZaGyvtPaC1VnQ6nTOl1Idut3vFzK8Q8TURfc3A0Wi0pZQ6KMtyzVp7471/DwBPiOjwUaD3/lOM8brX651UAmbeRMTZlNIyIkoA2CaiHD3HRmY+jTGSMeZXro0dFkUxL6UsiOgtIqZ63AyNMX6WUq5WsGrdOfdMCNGvOmAMdM71EfEdAPyuwYZa62GeF0UxZ4y5zt/MnBM8rXQxxiUhxJLW+qIOtIj4pdFn+1rrfrP3mPkSAObr9RDCgjHmxyTgT0TUAHDnLMaIiLgCAHvNQ9oCJ/0Y4/W/D8w3GULYbG2pIZRSvrx3KX8Kau5r/dq0PXDqwFvex7YVooeX4gAAAABJRU5ErkJggg==';
    let html = '';
    if(deleted){
        html = `<tr><td colspan="2">
              <img class="va-mid crsr" title="Go back to saved ${noteTitles}" onclick="refresh${noteTitles}()" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAqElEQVQ4T+XTPQ4BQRgG4EfJSRQ6P2eTKCRqIlHgAhpXcggSlULISFasMPuRrZh23jzzfrOzDTWvRs2e3wDb2OEcuZ6qkXsYYBnBUiYHfozlwIT1sYo2K3KvGiaoi/Wn2KuGHSywDWIbHB+zzw1bGGOOQwA94ZID014TI0yDaOncd1/5azT3bAp0hn1g/Fuk6mEndIhJXX9KcWjp4nNtqxpGJ73n/hC8AuC7FhXj6d9CAAAAAElFTkSuQmCC" />
              Recyle Bin ${noteTitles} </td> </tr>`;
    }

    if(notes.length){
        notes.forEach(function (note) {
            html += `<tr id="${noteTitle}_${note.id}">`;
                  if(isNotes == 1){
                    html += `<td id="first_${noteTitle}_${note.id}" onclick="edit${noteTitle}(${note.id})">${note.title}<br/><small class="dateTimeFormater">on ${formatDate(note.updated_at)}</small>`;
                  } else{
                    html += `<td id="first_${noteTitle}_${note.id}" onclick="edit${noteTitle}(${note.id})" title="Double click to Edit">${note.title}`;
                  }
                  html += `</td><td id="second_${noteTitle}_${note.id}">`;
                  if(deleted){
                      html += `<img class="left" title="Restore ${noteTitle}" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAABGUlEQVQ4T+3TvytFYRjA8c+VGBSjMhiU8kcIIwNlkcEg2RlYlGxKCX+AgcEiNn8BCZtNBlIsBouUEtGT9+q43XNd3bso73Q653m+7/PjewrqfAp15vmbwFH04xxbaMEQ2vGEAzzkjapcyxuYwT7OsJSgRcYrVrGIeP52KgGv0YUjrOAGPZjGIPYwhvcssRIw4g6xgDecpsTIWcMsJrH9G2BebDPucIG+egCDETMeQVO27Vo83MEwWn+qsPi9A49JldJlNuIKt+itBhjbDWWO0yZfMknR1XpSawJR6dfJazneb2IqbXcZl+jGfBJ/F+PVaFO8rSEpM4e2TBGhUMgfYj9XI3ZpTAx9AJ24x0lSpuzfV8uW/4GfE/gA1MQ1Fb3c8ikAAAAASUVORK5CYII=" onclick="restore${noteTitle}(${note.id})"/>
                      <img title="Delete Parmanently" src="${deleteImg}" onclick="delete${noteTitle}(${note.id})" class="delete"/>`;
                  } else{
                      if(!isNotes){
                        html += `<a href="javascript:;" class="mr2" onclick="showCategoryNotes(${note.id})">(${note.notes})</a>`;
                      } else{
                          html += `<img title="Download" src="${donwloadImg}" onclick="download${noteTitle}Html(${note.id})" class="download"/>`;
                      }
                      html += `<img title="Delete ${noteTitle}" src="${deleteImg}" onclick="trash${noteTitle}(${note.id})" class="delete ${vabtm}"/>`;
                  }
                  
            html += `</td> </tr>`;
        });
    }

    return html;
}

function setEditorContent(content){
    if(typeof editor != 'undefined') editor.html.set(content);
}

function getEditorContent(){
    return editor.html.get(true);
}

function getTitle(){
    var txt = editor.html.get(true);
    txt = txt.replace(/&nbsp;/g, ' ');
    txt = txt.replace(/\r?\n|\r/g, "");
    txt = txt.replace(/<[^>]*>?/gm, '').substring(0,25);
    txt = txt.trim();

    return txt;
}

function updateCatTitle(title){
    getElement('cat_or_note').innerHTML = `<img class="crsr" title="Go to Home" onclick="refreshCategories()" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAANCAYAAACgu+4kAAABQklEQVQ4T7WSMU8CQRSE5+1xsbKzUjwOWDl7IdjaECrsTCQm/gULW3+Ajf/ARhu1s7KwsjA2aK3J3rE5YqWVFgLKPrMYLqhIrnGrfTszXzazS5iyirn8HhNXDLChte5OstIfeZKef8CEnS+dr8h1G0qpl5/+SQCn6HmHILE9bmbgTriZulLqafz8G0BKOTPo908FifWJN2PzwJlMLYqieKQngCAIZt/feudEWJvWi2HTYSFqWut76xsCSvOluYHbuwCoPC080gz4WTDXwzi+Jbkgs6CPS3awnCacQNi8OkI0qLBYKJNjsjAogbCfDsK7IAoBdJMOpO+vMuMmDYCNqESdqJV0YDe/AdwyzI9WEySyAFZG8HQAwmao9ckQ7uW3mPj4fwFLvl81jOvkgzA1Vdw+s3Mhl2sS6Cjph03VPqGdPwFxRJFd/H4BaQAAAABJRU5ErkJggg=="> ${title} - Notes`;
}

function getRow(id, onlyName){
    let row = viewType == 1 ? 'Category': 'Note';
    let name = `${row}_${id}`;
    if(onlyName) return name;
    
    return getElement(name);
}

async function markActive(id){
    let table = getElement("notesList");
    for (let i = 0, row; row = table.rows[i]; i++) {
        row.classList.remove("active");
    }
   
    let el = getRow(id);
    if(el) el.classList.add("active");
}

async function updateCategoryId(noteId, cateId){
    let noteObj = {};
    noteObj.id = noteId;
    noteObj.category_id = cateId;
    await db.notes.update(noteObj.id, {
        category_id: noteObj.category_id, updated_at: new Date()
    });
}

async function getLastNote(field, status){
    if(status != null) return await db.notes.orderBy(field).and(x => x.status===status).reverse().limit(1).toArray();
    return await db.notes.orderBy(field).reverse().limit(1).toArray();
}

async function getLastCategory(field, status){
    if(status != null) return await catdb.category.orderBy(field).and(x => x.status===status).reverse().limit(1).toArray();
    return await catdb.category.orderBy(field).reverse().limit(1).toArray();
}

async function showLastNote() {
    let results = await getLastNote('updated_at', 1);

    if(results.length == 1 ){
      note.value = results[0].description || '';
      setEditorContent(note.value);
      attr(note, 'data-id', results[0].id);
      setTimeout(function(){
        let el = getRow(results[0].id);
        if(el) el.classList.add('active');
       },100);
    } else{
        attr(note, 'data-id', 0);
    }
}

async function refreshBinNotes(){
    let rows;
    timeout = null;
    setEditorContent('');
    note.value = '';
    attr(note, 'data-id', 0);

    if(viewType==1){
        rows = await catdb.category.orderBy('updated_at').and(x => x.status===0).reverse().toArray();
        getElement('notesList').innerHTML = getSidebar(0, rows, 1);
    } else{
        rows = await db.notes.orderBy('updated_at').and(x => x.status===0).reverse().toArray();
        getElement('notesList').innerHTML = getSidebar(1, rows, 1);
    }
    
    hideElement('deleted_note');
    hideElement('sync_note');
    hideElement('new_note');
}

async function refreshNotes(id, forceNotes) {
    if(catId || forceNotes){
        let where = {'status':1};
        where.category_id = catId || 0;
        viewType = 0;
        let notes = await db.notes.where(where).reverse().sortBy('updated_at');
        if(!catId && forceNotes){
            updateCatTitle('Uncategorised');
        }
        getElement('notesList').innerHTML = getSidebar(1, notes, 0);
        showElement('deleted_note');
        showElement('sync_note');
        showElement('new_note');
        if(id){
            attr(note, 'data-id', id);
            await markActive(id);
        }
    } else{
        await refreshCategories();
    }
}

async function refreshCategories(id) {
    viewType = 1;
    let cats = await catdb.category.where('status').equals(1).sortBy('title');
    let catCopy = [];
    let notesCount = await db.notes.where({ 'status': 1, 'category_id': 0}).count();

    let item = {};
        item.id = 0;
        item.title = 'Uncategorised';
        item.notes = notesCount;
        catCopy.push(item);

    for(let i=0;i<cats.length;i++){
        let cat = cats[i];
        let item = {};
        item.id = cat.id;
        item.title = cat.title;
        let notesCount = await db.notes.where({ 'status': 1, 'category_id': cat.id}).count();
        item.notes = notesCount;
        catCopy.push(item);
    };

    getElement('notesList').innerHTML = getSidebar(0, catCopy, 0);
    showElement('deleted_note');
    showElement('sync_note');
    showElement('new_note');
    getElement('cat_or_note').innerHTML = 'Categories';
    setEditorContent('');
    if(id){
        catId = id;
        await markActive(id);
    } else{
        catId = null;
    }
    attr(note, 'data-id', 0);
}

async function showCategoryNotes(id, noteId){
    if(id){
        let catData = await catdb.category.where('id').equals(id).sortBy('updated_at');
        updateCatTitle(catData[0].title);
    } else{
        updateCatTitle('Uncategorised');
    }

    let notes = await db.notes.where({'status': 1, 'category_id':id}).reverse().sortBy('updated_at');

    getElement('notesList').innerHTML = getSidebar(1, notes, 0);

    if(noteId!= undefined) {
        await markActive(noteId);
        attr(note, 'data-id', noteId);
    } else{
        attr(note, 'data-id', 0);
    }
    viewType = 0;
    catId = id;
    showElement('deleted_note');
    showElement('sync_note');
    showElement('new_note');
    
    note.value = '';
}

async function addNewNote(){
    timeout = null;
    setEditorContent('');
    note.value = '';

    // insert a new note
    let id = 1;
    let idData;
    noteObj = {};

    if(viewType == 1){
        idData = await getLastCategory('id', null);
        noteObj.title = 'New Category';
    } else{
        idData = await getLastNote('id', null);
        noteObj.title = 'New Note';
        noteObj.category_id = catId;
        noteObj.description = '';
    }
    
    if(idData.length == 1) id = idData[0].id+1;
    noteObj.id          = Number(id); 
    noteObj.status      = 1; 
    noteObj.created_at  = new Date();
    noteObj.updated_at  = new Date();

    if(viewType == 1){
        catdb.category.add(noteObj).then((id) => {
            refreshCategories(id);
        });
    } else{
        db.notes.add(noteObj).then((id) => {
            refreshNotes(id);
        });
    }
}

async function addNote() {
    if(contentUpdated === false) return;
    let noteObj = await getNoteContent();
    noteObj.status = 1;
    if(noteObj.title =='' || noteObj.title == undefined) return;

    try {
        if(noteObj.id !== undefined && noteObj.id != 0){
            await db.notes.update(noteObj.id, {
                title: getTitle(), description: noteObj.description, updated_at: new Date()
            }).then(function (updated) {
              if(catId==null) viewType = 0;  
              if (updated) refreshNotes(noteObj.id, 1);
            });
        } else{
            if(noteObj.id==0){
                let id = 1;
                let idData = await getLastNote('id', null);

                if(idData.length == 1) id = idData[0].id+1;
                noteObj.id =  Number(id); 
            }
            noteObj.category_id = (catId == null) ? 0 : catId;
            noteObj.created_at = new Date();
            noteObj.updated_at = new Date();

            db.notes.add(noteObj).then((id) => {
                if(catId==null) viewType = 0;
                refreshNotes(id, 1);
            });
        }
    } catch (e) {
        console.log(e.message);
    }
}

async function editNote(id){
    if (typeof editor == 'undefined') {
        editor = initFroala();
    }

    let results = await db.notes.where('id').equals(id).toArray();
    
    if(results.length == 1 ){
        contentUpdated = false;
        note.value = results[0].description || '';
        setEditorContent(note.value);
        getElement('search').value = '';
        if(viewType==1) viewType = 0;
        showCategoryNotes(results[0].category_id, id);
    }
}

async function editCategory(id){
    let results = await catdb.category.where('id').equals(id).toArray();
    
    if(results.length == 1 ){
        let el = 'first_'+getRow(id, 1);
        new FroalaEditor('#'+el, {
            editInPopup: true,
            events: {
                contentChanged: function () {
                  updateCategory(id, getElement(el).innerText);
                }
            }
        })
    }
}

async function restoreNote(id) {
    await db.notes.update(id, { status: 1, updated_at: new Date() }).then(function (updated) {
      refreshBinNotes();
    });
}

async function trashNote(id) {
    await db.notes.update(id, { status: 0, updated_at: new Date() }).then(function (updated) {
      refreshNotes(catId, 1);
    });
}

async function deleteNote(id) {
    await db.notes.delete(id).then(function (updated) {
      refreshBinNotes();
    });
}

async function downloadNote(id) {
    let results = await db.notes.where('id').equals(id).toArray();
    if(results.length==1) download(safeName(results[0].title, 'txt'), results[0].description);
}

async function downloadNoteHtml(id) {
    let results = await db.notes.where('id').equals(id).toArray();
    if(results.length==1) download(safeName(results[0].title, 'html'), getNoteHtml(results[0].title, results[0].description));
}

async function getNoteContent() {
    return {
        id: Number(note.getAttribute('data-id')),
        title: getTitle(),
        description: getEditorContent()
    };
}

async function searchNote(txt) {
    var pattern = new RegExp(txt,'i');
    let el = getElement('deleted_note').style.display;
    let deleted = 0;
    let status = 1;

    if(el == 'none'){
        status = 0;
        deleted = 1;
    }

    db.notes.orderBy('updated_at').and(x => x.status===status).reverse().filter(function (note) {
        return pattern.test(note.description);
    }).toArray().then(function(notes) {
        getElement('notesList').innerHTML = getSidebar(1, notes, deleted);
        updateCatTitle('Search');
    });
}

async function syncNotes() {
    let rows;
    let time = new Date();
    let cat = '';
    // if downloading json data provide category data too;
    let results = await catdb.category.toArray();

    if(catId!=null){
        rows = await db.notes.where('category_id').equals(catId).toArray();
        let results = await catdb.category.where('id').equals(catId).toArray();
        if(results.length == 1){
            cat = results[0].title+'_';
        }
    } else{
        rows = await db.notes.toArray();
    }

    let arr = {};
    arr.notes = rows;
    arr.categories = results;
    download(safeName('notebook_'+cat+time, 'json'), arr);
}

async function getActiveId(){
    return note.getAttribute('data-id');
}

async function updateCategory(catId, title){
    catId = Number(catId);

    await catdb.category.update(catId, {
        title: title, updated_at: new Date()
    }).then(function (updated) {
      if (updated) refreshCategories(catId);
    }).catch(err => {
        console.log(err);
    });
}

async function trashCategory(id){
    await catdb.category.update(id, { status: 0, updated_at: new Date() }).then(function (updated) {
      refreshCategories();
    });
}

async function restoreCategory(id) {
    await catdb.category.update(id, { status: 1, updated_at: new Date() }).then(function (updated) {
      refreshBinNotes();
    });
}

async function deleteCategory(id) {
    await catdb.category.delete(id).then(function (updated) {
      refreshBinNotes();
    });
}
