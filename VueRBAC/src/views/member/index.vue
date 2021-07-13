<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom:10px">
      <el-input
        v-model="listQuery.username"
        placeholder="昵称"
        style="width: 200px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="listQuery.type"
        placeholder="角色"
        clearable
        class="filter-item"
        style="width: 150px"
      >
        <el-option
          v-for="item in userTypeOptions"
          :key="item.key"
          :label="item.display_name+'('+item.key+')'"
          :value="item.key"
        />
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" style="margin-left:20px" @click="handleFilter">搜索</el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >新建</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
      :row-class-name="tableRowClassName"
      :default-sort = "{prop: 'type', order: 'ascending'}"
    >
      <el-table-column align="center" label="ID" width="95">
        <template slot-scope="scope">{{ scope.$index }}</template>
      </el-table-column>
      <el-table-column label="用户名">
        <template slot-scope="scope">{{ scope.row.username }}</template>
      </el-table-column>
      <el-table-column label="类型" width="150" align="center" prop="type">
        <template slot-scope="scope">
            <span v-if="scope.row.type=='admin'">管理员（Admin)</span>
            <span v-else-if="scope.row.type=='editor'">编辑者(Editor)</span>
            <span v-else-if="scope.row.type=='visitor'">游客(Visitor)</span>
              <span v-else-if="scope.row.type=='superAdmin'">超级管理员(SuperAdmin)</span>
            
            </template>
      </el-table-column>
      <el-table-column label="注册时间" width="180px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.registerTime  }}</span>
        </template>
      </el-table-column>
      
<el-table-column label="操作">
      <template slot-scope="scope">
   <el-button type="primary" size="medium" @click="handleUpdate(scope.row)">编辑</el-button>
    <el-button  type="danger" size="medium" @click="handleDelete(scope.$index,list)">删除</el-button>
      </template>
    </el-table-column>

    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="fetchData"
    />
    <!-- 弹出对话框，用于新建用户 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="70px"
        style="width: 400px margin-left:50px"
      >
        <el-form-item label="昵称" prop="username">
          <el-input v-model="temp.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="temp.password" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select
            v-model="temp.type"
            class="filter-item"
            placeholder="Please select"
          ><el-option v-for="item in userTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" /></el-select>
        </el-form-item>
        <el-form-item label="添加时间" prop="timestamp">
          <el-date-picker
            v-model="temp.timestamp"
            type="datetime"
            placeholder="Please pick a date"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="temp.remark"
            :autosize="{ minRows: 2, maxRows: 4 }"
            type="textarea"
            placeholder="Please input"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确定</el-button>
      </div>
    </el-dialog>
    <!-- 弹出对话框，用于新建用户 end-->
  </div>
</template>
<style>
 .el-table .warning-row {
    background: oldlace;
  }

  .el-table .success-row {
    background: #f0f9eb;
  }
</style>
<script>
import { fetchList, createMember, updateMember } from '@/api/member'
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const userTypeOptions = [
  { key: 'admin', display_name: '管理员(admin)' },
  { key: 'editor', display_name: '编辑(editor)' },
  { key: 'visitor', display_name: '游客(visitor)' }
]

export default {
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = { published: 'success', draft: 'gray', deleted: 'danger'
      }
      return statusMap[status]
    },
    parseTime(time, cFormat) {
      return parseTime(time, cFormat)
    }
  },
  data() {
    return {
      list: null,
      listLoading: true,
      total: 0,
      listQuery: { page: 1, limit: 20, username: undefined, type: undefined, sort: '+id'
      },
      userTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }
      ],
      temp: { id: undefined, remark: '', timestamp: new Date(), username: '', password: '', type: ''},
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: { update: '编辑', create: '新建' },
      // 编辑用户信息-表单验证
      rules: {
        username: [{
          required: true, message: 'username is required', trigger: 'blur' }],
        password: [{ required: true, message: 'password is required', trigger: 'blur' }],
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    // get memebers list
    fetchData() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        setTimeout(() => { this.listLoading = false }, 500)
      })
    },
     tableRowClassName({row, rowIndex}) {
        if (rowIndex%2==1) {
          return 'warning-row';
        } else if (rowIndex%2==0) {
          return 'success-row';
        }
        return '';

    },
    handleFilter() {
      console.log('search', this.listQuery.username)
      this.fetchData()
    },

    // open the dialog
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },

    // add a memeber
    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          this.temp.author = 'vue-element-admin'
          createMember(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
              type: 'success',
              duration: 2000 })
          })
        }
      })
    },

    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
handleDelete(index,rows) {  
     rows.splice(index,1)
      },

    updateData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateMember(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },

    resetTemp() {
      this.temp = { id: undefined, remark: '', timestamp: new Date(), title: '', type: ''
      }
    }
  }
}
</script>