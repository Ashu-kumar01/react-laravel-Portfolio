import { http, toFormData, unwrap } from './client'

/** Generic REST resource helpers for the admin API. */
function resource(path, { multipart = false } = {}) {
  return {
    list: (params = {}) => http.get(`/admin/${path}`, { params }).then(unwrap),
    get: (id) => http.get(`/admin/${path}/${id}`).then(unwrap),
    create: (values) => http.post(`/admin/${path}`, multipart ? toFormData(values) : values).then(unwrap),
    update: (id, values) =>
      multipart
        ? http.post(`/admin/${path}/${id}`, toFormData(values, 'PUT')).then(unwrap)
        : http.put(`/admin/${path}/${id}`, values).then(unwrap),
    patch: (id, values) => http.patch(`/admin/${path}/${id}`, values).then(unwrap),
    remove: (id) => http.delete(`/admin/${path}/${id}`).then(unwrap),
  }
}

export const authApi = {
  login: (credentials) => http.post('/admin/login', credentials).then(unwrap),
  logout: () => http.post('/admin/logout').then(unwrap),
  me: () => http.get('/admin/me').then(unwrap),
  updateAccount: (values) => http.put('/admin/account', values).then(unwrap),
  updatePassword: (values) => http.put('/admin/account/password', values).then(unwrap),
}

export const adminApi = {
  dashboard: () => http.get('/admin/dashboard').then(unwrap),
  projects: resource('projects', { multipart: true }),
  technologies: resource('technologies', { multipart: true }),
  experiences: resource('experiences'),
  services: resource('services'),
  messages: {
    list: (params = {}) => http.get('/admin/messages', { params }).then(unwrap),
    get: (id) => http.get(`/admin/messages/${id}`).then(unwrap),
    setStatus: (id, status) => http.patch(`/admin/messages/${id}/status`, { status }).then(unwrap),
    remove: (id) => http.delete(`/admin/messages/${id}`).then(unwrap),
  },
  resume: {
    get: () => http.get('/admin/resume').then(unwrap),
    upload: (file, title, onUploadProgress) =>
      http.post('/admin/resume', toFormData({ file, title }), { onUploadProgress }).then(unwrap),
    remove: () => http.delete('/admin/resume').then(unwrap),
    /** Downloads through the authenticated endpoint and returns a Blob. */
    download: () => http.get('/admin/resume/download', { responseType: 'blob' }).then((res) => res.data),
  },
  settings: {
    get: () => http.get('/admin/settings').then(unwrap),
    update: (values) => http.put('/admin/settings', values).then(unwrap),
    /** Image settings (hero_image, og_image) are uploaded separately as multipart. */
    uploadImage: (key, file) => http.post(`/admin/settings/images/${key}`, toFormData({ image: file })).then(unwrap),
    removeImage: (key) => http.delete(`/admin/settings/images/${key}`).then(unwrap),
  },
}
