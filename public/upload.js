// Camera and file upload preview functionality

document.addEventListener('DOMContentLoaded', function() {
  const photoInput = document.getElementById('photoInput');
  const cameraBtn = document.getElementById('cameraBtn');
  const photoPreview = document.getElementById('photoPreview');
  const previewImg = document.getElementById('previewImg');

  if (!photoInput || !cameraBtn) return;

  // Trigger camera on button click
  cameraBtn.addEventListener('click', function() {
    photoInput.click();
  });

  // Show preview when file is selected
  photoInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image/jpeg') && !file.type.match('image/jpg')) {
        alert('Please select a .jpg or .jpeg file');
        photoInput.value = '';
        return;
      }

      // Show preview
      const reader = new FileReader();
      reader.onload = function(e) {
        previewImg.src = e.target.result;
        photoPreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      photoPreview.style.display = 'none';
    }
  });
});

