export const getAuthHeaders = () => {
    // const token = localStorage.getItem("access_token");
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzk3OTQ1NzI0LCJpYXQiOjE3NjY0MDk3MjQsImp0aSI6IjRkOTRiZTdjNmRiMzQ4ZTY4YjhiMzczNmFhMDc2MjlhIiwidXNlcl9pZCI6IjQifQ.xcQvkOHP8zGw26GSaNUk1kZJ47l32wToqAOHZufcz-w";
    if (!token) {
      console.error("Access token not found in localStorage");
      return {};
    }
    return {
      Authorization: `Bearer ${token}`,
    };
  };

export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export const base64ToFile = (base64String, fileName) => {
  const arr = base64String.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], fileName, { type: mime });
};

// Token + URL for Live
//   VITE_BASE_URL=https://gpcauto-ezh4e7hcf8dzbpcy.centralindia-01.azurewebsites.net
//   VITE_BEARER_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzk3OTQ1NzI0LCJpYXQiOjE3NjY0MDk3MjQsImp0aSI6IjRkOTRiZTdjNmRiMzQ4ZTY4YjhiMzczNmFhMDc2MjlhIiwidXNlcl9pZCI6IjQifQ.xcQvkOHP8zGw26GSaNUk1kZJ47l32wToqAOHZufcz-w

// Token + URL for Local
//   VITE_BASE_URL=https://6h086457-8000.inc1.devtunnels.ms
//   VITE_BEARER_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzkyMTI2MTM0LCJpYXQiOjE3NjA1OTAxMzQsImp0aSI6ImMyODgxOGYwMDhmYzRkYWY4YzJmZjE2M2VlMWZkMWFhIiwidXNlcl9pZCI6IjEifQ.GSBeSgj1dQFzhb7SW0S5g67ScQeN7nM0vKewpqr-TS4

