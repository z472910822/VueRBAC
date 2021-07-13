const Mock = require('mockjs')

const data = Mock.mock({
  'items|50': [
    {
      id: '@id',
      username: '@cname',
      'type|1': ['admin', 'editor', 'visitor'],
      timestamp: +Mock.Random.date('T'),
      pageviews: '@integer(300, 5000)',
      registerTime:'@datetime()'
    }
  ]
})

module.exports = [
  {
    url: '/vue-admin-template/member/list',
    type: 'get',
    response: config => {
      const { type, username, page = 1, limit = 20, sort } = config.query

      let mockList = data.items.filter(item => {
        if (type && item.type !== type) return false
        if (username && item.username.indexOf(username) < 0) return false
        return true
      })

      if (sort === '-id') {
        mockList = mockList.reverse()
      }

      const pageList = mockList.filter(
        (item, index) => index < limit * page && index >= limit * (page - 1)
      )

      return {
        code: 20000,
        data: {
          total: mockList.length,
          items: pageList
        }
      }
    }
  },
  {
    url: '/vue-admin-template/member/detail',
    type: 'get',
    response: config => {
      const { id } = config.query
      for (const memeber of data.items) {
        if (memeber.id === +id) {
          return {
            code: 20000,
            data: memeber
          }
        }
      }
    }
  },
  {
    url: '/vue-admin-template/member/create',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },
  {
    url: '/vue-admin-template/member/update',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  }
]