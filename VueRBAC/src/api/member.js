import request from '@/utils/request'

export function fetchList(params) {
  console.log('api')
  return request({
    url: '/vue-admin-template/member/list',
    method: 'get',
    params: params
  })
}

export function fetchMember(id) {
  return request({
    url: 'vue-admin-template/member/detail',
    method: 'get',
    params: { id }
  })
}

export function createMember(data) {
  return request({
    url: '/vue-admin-template/member/create',
    method: 'post',
    data
  })
}

export function updateMember(data) {
  return request({
    url: '/vue-admin-template/member/update',
    method: 'post',
    data
  })
}