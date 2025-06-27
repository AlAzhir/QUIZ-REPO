// ...existing code...

function encodeBase64(data) {
  return window.btoa(unescape(encodeURIComponent(data)));
}

//function decodeBase64(encoded) {
//  return decodeURIComponent(escape(window.atob(encoded)));
//}

// Example usage:
// const encoded = encodeBase64("Hello, world!");
// const decoded = decodeBase64(encoded);

// ...existing code...