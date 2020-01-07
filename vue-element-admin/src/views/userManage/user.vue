<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form>
        <el-form-item>
          <el-button v-if="hasPerm('user:add')" type="primary" icon="plus" @click="showCreate">添加
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table
      v-loading.body="listLoading"
      :data="list"
      element-loading-text="拼命加载中"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="序号" width="80">
        <template slot-scope="scope">
          <span v-text="getIndex(scope.$index)" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="昵称" prop="nickname" style="width: 60px;" />
      <el-table-column align="center" label="用户名" prop="username" style="width: 60px;" />
      <el-table-column align="center" label="角色" width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.roleId===1" type="success" v-text="scope.row.roleName" />
          <el-tag v-else type="primary" v-text="scope.row.roleName" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间" prop="createTime" width="170" />
      <el-table-column align="center" label="最近修改时间" prop="updateTime" width="170" />
      <el-table-column v-if="hasPerm('user:update')" align="center" label="管理" width="220">
        <template slot-scope="scope">
          <el-button type="primary" icon="edit" @click="showUpdate(scope.$index)">修改</el-button>
          <el-button
            v-if="scope.row.userId!=userId "
            type="danger"
            icon="delete"
            @click="removeUser(scope.$index)"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :current-page="listQuery.pageNum"
      :page-size="listQuery.pageRow"
      :total="totalCount"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        class="small-space"
        :model="tempUser"
        label-position="left"
        label-width="80px"
        style="width: 300px; margin-left:50px;"
      >
        <el-form-item v-if="dialogStatus=='create'" label="用户名" required>
          <el-input v-model="tempUser.username" type="text" />
        </el-form-item>
        <el-form-item v-if="dialogStatus=='create'" label="密码" required>
          <el-input v-model="tempUser.password" type="password" />
        </el-form-item>
        <el-form-item v-else label="新密码">
          <el-input v-model="tempUser.password" type="password" placeholder="不填则表示不修改" />
        </el-form-item>
        <el-form-item v-if="hasPerm('group:list')" label="所属组织" required>
          <el-select v-model="tempUser.groupId" placeholder="请选择" @focus="getAllGroups">
            <el-option
              v-for="item in groups"
              :key="item.groupId"
              :label="item.groupName"
              :value="item.groupId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" required>
          <el-select v-model="tempUser.roleId" placeholder="请选择">
            <el-option
              v-for="item in roles"
              :key="item.roleId"
              :label="item.roleName"
              :value="item.roleId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="昵称" required>
          <el-input v-model="tempUser.nickname" type="text" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="success" @click="createUser">创 建</el-button>
        <el-button v-else type="primary" @click="updateUser">修 改</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      totalCount: 0, // 分页组件--数据总条数
      list: [], // 表格的数据
      listLoading: false, // 数据加载等待动画
      listQuery: {
        pageNum: 1, // 页码
        pageRow: 50// 每页条数
      },
      groupQuery: {
        type: 1
      },
      roles: [], // 角色列表
      groups: [], // 店铺列表
      dialogStatus: 'create',
      dialogFormVisible: false,
      textMap: {
        update: '编辑',
        create: '新建用户'
      },
      tempUser: {
        username: '',
        password: '',
        nickname: '',
        roleId: '',
        groupId: '',
        groupName: '',
        userId: ''
      }
    }
  },
  created() {
    this.getList()
    if (this.hasPerm('user:add') || this.hasPerm('user:update')) {
      this.getAllRoles()
    }
  },
  computed: {
    ...mapGetters([
      'userId'
    ])
  },
  methods: {
    getAllRoles() {
      this.api({
        url: '/user/getAllRoles',
        method: 'get'
      }).then(data => {
        this.roles = data.list
      })
    }, getAllGroups() {
      if (this.groups.length === 0) {
        this.api({
          url: '/group/list',
          method: 'get',
          params: this.groupQuery
        }).then(data => {
          this.groups = data.data
        })
      }
    },
    getList() {
      // 查询列表
      this.listLoading = true
      this.api({
        url: '/user/list',
        method: 'get',
        params: this.listQuery
      }).then(data => {
        this.listLoading = false
        this.list = data.list
        this.totalCount = data.totalCount
      })
    },
    handleSizeChange(val) {
      // 改变每页数量
      this.listQuery.pageRow = val
      this.handleFilter()
    },
    handleCurrentChange(val) {
      // 改变页码
      this.listQuery.pageNum = val
      this.getList()
    },
    handleFilter() {
      // 查询事件
      this.listQuery.pageNum = 1
      this.getList()
    },
    getIndex($index) {
      // 表格序号
      return (this.listQuery.pageNum - 1) * this.listQuery.pageRow + $index + 1
    },
    showCreate() {
      // 显示新增对话框
      this.tempUser.username = ''
      this.tempUser.password = ''
      this.tempUser.nickname = ''
      this.tempUser.roleId = ''
      this.tempUser.userId = ''
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.getAllGroups()
    },
    showUpdate($index) {
      this.getAllGroups()
      const user = this.list[$index]
      this.tempUser.username = user.username
      this.tempUser.nickname = user.nickname
      this.tempUser.roleId = user.roleId
      this.tempUser.userId = user.userId
      this.tempUser.groupId = user.groupId
      this.tempUser.groupName = user.groupName
      this.tempUser.deleteStatus = '1'
      this.tempUser.password = ''
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
    },
    createUser() {
      // 添加新用户
      this.api({
        url: '/user/addUser',
        method: 'post',
        data: this.tempUser
      }).then(() => {
        this.getList()
        this.dialogFormVisible = false
      })
    },
    updateUser() {
      // 修改用户信息
      const _vue = this
      this.api({
        url: '/user/updateUser',
        method: 'post',
        data: this.tempUser
      }).then(() => {
        let msg = '修改成功'
        this.dialogFormVisible = false
        if (this.userId === this.tempUser.userId) {
          msg = '修改成功,部分信息重新登录后生效'
        }
        this.$message({
          message: msg,
          type: 'success',
          duration: 1 * 1000,
          onClose: () => {
            _vue.getList()
          }
        })
      })
    },
    removeUser($index) {
      const _vue = this
      this.$confirm('确定删除此用户?', '提示', {
        confirmButtonText: '确定',
        showCancelButton: false,
        type: 'warning'
      }).then(() => {
        const user = _vue.list[$index]
        user.deleteStatus = '2'
        _vue.api({
          url: '/user/updateUser',
          method: 'post',
          data: user
        }).then(() => {
          _vue.getList()
        }).catch(() => {
          _vue.$message.error('删除失败')
        })
      })
    }
  }
}
</script>
