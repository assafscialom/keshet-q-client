@extends('voyager::master')

@section('page_title', 'ניהול מוצרים')

@section('content')
<div class="page-content container-fluid" dir="rtl" style="font-family: Arial, sans-serif;">
    <h1 class="page-title" style="margin-bottom:20px;">🖼️ ניהול מוצרים</h1>

    <div class="row" style="margin-bottom:20px;">
        <div class="col-md-8">
            <div class="input-group">
                <input id="pm-search" type="text" class="form-control" placeholder="חפש לפי שם מוצר או ברקוד..." style="font-size:16px;height:44px;">
                <span class="input-group-btn">
                    <button id="pm-search-btn" class="btn btn-primary" style="height:44px;font-size:16px;">חפש</button>
                </span>
            </div>
        </div>
    </div>

    <div id="pm-error" class="alert alert-danger" style="display:none;"></div>
    <div id="pm-loading" style="display:none;color:#888;margin-bottom:12px;">טוען...</div>

    <div id="pm-list"></div>
</div>

<style>
.pm-card { background:#fff; border-radius:10px; box-shadow:0 1px 5px rgba(0,0,0,.1); padding:14px 16px; margin-bottom:12px; display:flex; align-items:flex-start; gap:16px; }
.pm-img-wrap { position:relative; width:80px; height:80px; flex-shrink:0; border-radius:8px; overflow:hidden; background:#f0f0f0; display:flex; align-items:center; justify-content:center; font-size:30px; color:#ccc; }
.pm-img-wrap img { width:100%; height:100%; object-fit:cover; }
.pm-img-upload { position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,.45); color:#fff; text-align:center; cursor:pointer; font-size:16px; padding:3px 0; }
.pm-body { flex:1; min-width:0; }
.pm-view-name { font-size:17px; font-weight:700; cursor:pointer; color:#222; }
.pm-view-name:hover { color:#1e3f8f; }
.pm-view-sku { font-size:13px; color:#888; margin-top:2px; }
.pm-edit-hint { font-size:12px; color:#bbb; margin-top:4px; }
.pm-edit-form input { display:block; width:100%; padding:7px 10px; margin-bottom:8px; border:1.5px solid #ddd; border-radius:7px; font-size:15px; }
.pm-edit-form input:focus { outline:none; border-color:#1e3f8f; }
.pm-btn { padding:7px 14px; border:none; border-radius:7px; cursor:pointer; font-size:14px; }
.pm-btn-primary { background:#1e3f8f; color:#fff; }
.pm-btn-danger { background:#fff; color:#c0392b; border:1.5px solid #c0392b; }
.pm-btn-secondary { background:#f0f0f0; color:#555; }
.pm-actions { display:flex; gap:8px; flex-wrap:wrap; margin-top:6px; }
</style>

<script>
var csrfToken = '{{ csrf_token() }}';
var searchUrl = '{{ route("product-manager.search") }}';
var updateUrl = '{{ url("product-manager") }}';

function showError(msg) {
    var el = document.getElementById('pm-error');
    el.textContent = msg;
    el.style.display = msg ? 'block' : 'none';
}

function doSearch() {
    var q = document.getElementById('pm-search').value.trim();
    if (!q) return;
    document.getElementById('pm-loading').style.display = 'block';
    document.getElementById('pm-list').innerHTML = '';
    showError('');
    fetch(searchUrl + '?search=' + encodeURIComponent(q))
        .then(function(r){ return r.json(); })
        .then(function(data){ renderList(data); })
        .catch(function(){ showError('שגיאה בחיפוש'); })
        .finally(function(){ document.getElementById('pm-loading').style.display = 'none'; });
}

function renderList(products) {
    var list = document.getElementById('pm-list');
    if (!products.length) { list.innerHTML = '<p style="color:#888">לא נמצאו מוצרים</p>'; return; }
    list.innerHTML = products.map(function(p){ return renderCard(p); }).join('');
}

function renderCard(p) {
    var imgHtml = p.image
        ? '<img src="' + p.image + '" alt="">'
        : '🖼️';
    return '<div class="pm-card" id="card-' + p.id + '">' +
        '<div class="pm-img-wrap">' + imgHtml +
        '<label class="pm-img-upload" title="העלה תמונה">📷<input type="file" accept="image/*" style="display:none" onchange="uploadImage(' + p.id + ', \'' + (p.sku||'').replace(/'/g,"\\'") + '\', this)"></label>' +
        '</div>' +
        '<div class="pm-body">' +
        '<div id="view-' + p.id + '">' +
        '<div class="pm-view-name" onclick="startEdit(' + p.id + ', \'' + escStr(p.name) + '\', \'' + escStr(p.sku) + '\')">' + escHtml(p.name) + '</div>' +
        '<div class="pm-view-sku">#' + escHtml(p.sku) + '</div>' +
        '<div class="pm-edit-hint">לחץ לעריכה</div>' +
        (p.image ? '<div class="pm-actions"><button class="pm-btn pm-btn-danger" onclick="deleteImage(' + p.id + ', \'' + (p.sku||'').replace(/'/g,"\\'") + '\')">מחק תמונה</button></div>' : '') +
        '</div>' +
        '<div id="edit-' + p.id + '" style="display:none">' +
        '<div class="pm-edit-form">' +
        '<input type="text" id="edit-name-' + p.id + '" value="' + escAttr(p.name) + '" placeholder="שם מוצר">' +
        '<input type="text" id="edit-sku-' + p.id + '" value="' + escAttr(p.sku) + '" placeholder="ברקוד">' +
        '<div class="pm-actions">' +
        '<button class="pm-btn pm-btn-primary" onclick="saveEdit(' + p.id + ')">שמור</button>' +
        '<button class="pm-btn pm-btn-secondary" onclick="cancelEdit(' + p.id + ')">ביטול</button>' +
        '</div></div></div>' +
        '</div></div>';
}

function escHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escAttr(s){ return String(s||'').replace(/"/g,'&quot;'); }
function escStr(s){ return String(s||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'"); }

function startEdit(id, name, sku) {
    document.getElementById('view-' + id).style.display = 'none';
    document.getElementById('edit-' + id).style.display = 'block';
}
function cancelEdit(id) {
    document.getElementById('edit-' + id).style.display = 'none';
    document.getElementById('view-' + id).style.display = 'block';
}

function saveEdit(id) {
    var name = document.getElementById('edit-name-' + id).value.trim();
    var sku  = document.getElementById('edit-sku-' + id).value.trim();
    if (!name || !sku) { alert('שם וברקוד הם שדות חובה'); return; }
    fetch(updateUrl + '/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
        body: JSON.stringify({ name: name, sku: sku })
    }).then(function(r){ return r.json(); }).then(function(){
        doSearch();
    }).catch(function(){ alert('שגיאה בשמירה'); });
}

function uploadImage(id, sku, input) {
    if (!input.files[0]) return;
    var form = new FormData();
    form.append('image', input.files[0]);
    form.append('_token', csrfToken);
    fetch(updateUrl + '/' + id + '/image', { method: 'POST', body: form })
        .then(function(r){ return r.json(); })
        .then(function(data){
            var card = document.getElementById('card-' + id);
            var wrap = card.querySelector('.pm-img-wrap');
            var label = wrap.querySelector('label');
            wrap.innerHTML = '<img src="' + data.image + '">' + label.outerHTML;
        })
        .catch(function(){ alert('שגיאה בהעלאת תמונה'); });
}

function deleteImage(id, sku) {
    if (!confirm('למחוק את התמונה?')) return;
    fetch(updateUrl + '/' + id + '/image', {
        method: 'DELETE',
        headers: { 'X-CSRF-TOKEN': csrfToken }
    }).then(function(){ doSearch(); })
      .catch(function(){ alert('שגיאה במחיקת תמונה'); });
}

document.getElementById('pm-search-btn').addEventListener('click', doSearch);
document.getElementById('pm-search').addEventListener('keydown', function(e){ if(e.key==='Enter') doSearch(); });
</script>
@endsection
