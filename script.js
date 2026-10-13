document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // Initial Setup
    // -------------------------------------------------------------
    const tanggalInput = document.getElementById('tanggal');
    if (tanggalInput) {
        tanggalInput.valueAsDate = new Date();
    }

    // -------------------------------------------------------------
    // Real-time Update Form ke Preview Surat
    // -------------------------------------------------------------
    function updatePreview() {
        const kota = document.getElementById('kota').value || 'Kota';
        const tglVal = document.getElementById('tanggal').value;
        let formattedDate = 'Tanggal';
        if (tglVal) {
            formattedDate = new Date(tglVal).toLocaleDateString('id-ID', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });
        }
        
        document.getElementById('out-tanggal').innerText = `${kota}, ${formattedDate}`;
        document.getElementById('out-namaPerusahaan').innerText = document.getElementById('namaPerusahaan').value || 'Nama Perusahaan';
        document.getElementById('out-kotaPerusahaan').innerText = 'Di ' + (document.getElementById('kotaPerusahaan').value || 'Kota Perusahaan');
        document.getElementById('out-posisi').innerText = document.getElementById('posisi').value || 'Posisi';
        document.getElementById('out-posisi-body').innerText = document.getElementById('posisi').value || 'Posisi';
        document.getElementById('out-sumberInfo').innerText = document.getElementById('sumberInfo').value || 'Media Informasi';
        document.getElementById('out-namaPelamar').innerText = document.getElementById('namaPelamar').value || 'Nama Anda';
        document.getElementById('out-pengalaman').innerText = document.getElementById('pengalaman').value || 'Saya memiliki latar belakang dan kompetensi yang relevan dengan posisi ini, serta berpengalaman dalam bidang tersebut.';
    }

    document.querySelectorAll('#lamaranForm input, #lamaranForm textarea').forEach(el => {
        el.addEventListener('input', updatePreview);
    });
    updatePreview();

    // -------------------------------------------------------------
    // Header Buttons (Print & Copy)
    // -------------------------------------------------------------
    document.getElementById('btnPrint').addEventListener('click', () => {
        window.print();
    });

    document.getElementById('btnCopy').addEventListener('click', () => {
        const area = document.getElementById('printable-area');
        navigator.clipboard.writeText(area.innerText);
        alert('Teks surat berhasil disalin!');
    });

    // -------------------------------------------------------------
    // Canvas Tanda Tangan Logic
    // -------------------------------------------------------------
    const canvas = document.getElementById('signatureCanvas');
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let currentColor = '#000000';

    function initCanvasSize() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 2.5;
    }
    initCanvasSize();

    // Pilihan Warna Tinta
    document.querySelectorAll('.btn-color').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentColor = e.target.getAttribute('data-color');
        });
    });

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    function startDrawing(e) {
        isDrawing = true;
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.strokeStyle = currentColor;
    }

    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const pos = getPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    }

    function stopDrawing() {
        if (isDrawing) {
            isDrawing = false;
            syncSignatureToPreview();
        }
    }

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);

    document.getElementById('btnClearCanvas').addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const img = document.getElementById('out-signature');
        img.src = '';
        img.classList.add('hidden');
    });

    function syncSignatureToPreview() {
        const img = document.getElementById('out-signature');
        img.src = canvas.toDataURL('image/png');
        img.classList.remove('hidden');
    }

    // -------------------------------------------------------------
    // Switch Tab Mode Tanda Tangan (Draw vs Upload)
    // -------------------------------------------------------------
    const tabDraw = document.getElementById('tabDraw');
    const tabUpload = document.getElementById('tabUpload');
    const drawSec = document.getElementById('drawSection');
    const uploadSec = document.getElementById('uploadSection');

    tabDraw.addEventListener('click', () => {
        drawSec.classList.remove('hidden');
        uploadSec.classList.add('hidden');
        tabDraw.className = "text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium";
        tabUpload.className = "text-xs px-3 py-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white font-medium border border-slate-700";
    });

    tabUpload.addEventListener('click', () => {
        drawSec.classList.add('hidden');
        uploadSec.classList.remove('hidden');
        tabUpload.className = "text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium";
        tabDraw.className = "text-xs px-3 py-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white font-medium border border-slate-700";
    });

    // Handle Upload Tanda Tangan Gambar
    document.getElementById('sigUploadInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                const img = document.getElementById('out-signature');
                img.src = evt.target.result;
                img.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });
});