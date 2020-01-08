import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/poem-poetry/list',
    method: 'get',
    params: query
  })
}

export function fetchArticle(id) {
  return request({
    url: '/poem-poetry/detail',
    method: 'get',
    params: { id }
  })
}

export function createArticle(data) {
  return request({
    url: '/poem-poetry/add',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/poem-poetry/update',
    method: 'post',
    data
  })
}
