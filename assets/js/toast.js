export const showToast = (toastId, { label, msg }) => {
    let toast;
    toast = document.querySelector(`#${toastId}`);
    if (!toast) {
        toast = document.createElement('div');
    }
    toast.classList.add('toast', 'position-fixed');
    toast.style.bottom = '8%';
    toast.style.right = '5%';
    toast.id = toastId;
    toast.style.zIndex = 999999;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomice', 'true');
    toast.innerHTML = `<div class="toast-header">
    <strong class="me-auto">${label}</strong>
    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
  </div>
  <div class="toast-body">
    ${msg}
  </div>`;
    document.body.appendChild(toast);
    $(function () {
        bootstrap.Toast.getOrCreateInstance(toast).show();
    });
};
