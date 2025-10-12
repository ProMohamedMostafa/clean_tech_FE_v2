export function objectToFormData(obj: Record<string, any>): FormData {
  const formData = new FormData();
  for (const key in obj) {
    if (
      obj.hasOwnProperty(key) &&
      obj[key] !== undefined &&
      obj[key] !== null
    ) {
      // handle file(s)
      if (obj[key] instanceof File || obj[key] instanceof Blob) {
        formData.append(key, obj[key]);
      } else if (Array.isArray(obj[key])) {
        obj[key].forEach((item, index) => {
          formData.append(`${key}[${index}]`, item);
        });
      } else if (typeof obj[key] === 'object') {
        // optionally flatten nested objects if needed
        formData.append(key, JSON.stringify(obj[key]));
      } else {
        formData.append(key, obj[key]);
      }
    }
  }
  return formData;
}
