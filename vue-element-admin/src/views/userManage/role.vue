<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form>
        <el-form-item>
          <el-button v-if="hasPerm('role:add')" type="success" icon="plus" @click="showCreate">添加角色
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
      <el-table-column align="center" label="角色" prop="roleName" width="150" />
      <el-table-column align="center" label="用户">
        <template slot-scope="scope">
          <div v-for="user in scope.row.users" :key="user.id">
            <div style="display: inline-block;vertical-align: middle;" v-text="user.nickname" />
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="菜单&权限" width="420">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.roleName==adminName" type="success">全部</el-tag>
          <div v-else>
            <div v-for="menu in scope.row.menus" :key="menu.id" style="text-align: left">
              <span style="width: 100px;display: inline-block;text-align: right ">{{ menu.menuName }}</span>
              <el-tag
                v-for="perm in menu.permissions"
                :key="perm.permissionName"
                style="margin-right: 3px;"
                type="primary"
                v-text="perm.permissionName"
              />
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column v-if="hasPerm('role:update') ||hasPerm('role:delete') " align="center" label="管理" width="220">
        <template slot-scope="scope">
          <div v-if="scope.row.roleName!='超级管理员'">
            <el-button v-if="hasPerm('role:update')" type="primary" icon="edit" @click="showUpdate(scope.$index)">修改
            </el-button>
            <el-button
              v-if=" scope.row.users && scope.row.users.length===0 && hasPerm('role:delete')"
              type="danger"
              icon="delete"
              @click="removeRole(scope.$index)"
            >
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        class="small-space"
        :model="tempRole"
        label-position="left"
        label-width="100px"
        style="width: 600px; margin-left:50px;"
      >
        <el-form-item label="角色名称" required>
          <el-input v-model="tempRole.roleName" type="text" style="width: 250px;" />
        </el-form-item>
        <el-form-item label="菜单&权限" required>
          <p style="color:#848484;">说明:请注意对应菜单内的必选权限(一般列表项为必选权限)</p>
          <el-tree
                    ref="tree"
                   :check-strictly="checkStrictly"
                   :data="allPermission"
                    :props="defaultProps"
                    show-checkbox
                    :default-checked-keys="defaultCheckedKeys"
                    :default-expanded-keys="defaultExpandedKeys"
                    node-key="id"
                    class="permission-tree" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="success" @click="createRole">创 建</el-button>
        <el-button v-else type="primary" @click="updateRole">修 改</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      list: [], // 表格的数据
      allPermission: [],
      defaultCheckedKeys: [], // 编辑的时候需要设置进去
      defaultExpandedKeys: [],
      listLoading: false, // 数据加载等待动画
      dialogStatus: 'create',
      dialogFormVisible: false,
      checkStrictly: false,
      textMap: {
        update: '编辑',
        create: '新建角色'
      },
      tempRole: {
        roleName: '',
        roleId: '',
        permissions: []
      },
      defaultProps: {
        children: 'children',
        label: 'menuName'
      },
      adminName: '超级管理员'
    }
  },
  created() {
    this.getList()
    this.getAllPermisson()
  },
  methods: {
    getAllPermisson() {
      // 查询所有权限
      this.api({
        url: '/user/listAllPermission',
        method: 'get'
      }).then(data => {
        this.allPermission = data.data
      })
    },
    getList() {
      // 查询列表
      this.listLoading = true
      this.api({
        url: '/user/listRole',
        method: 'get'
      }).then(data => {
        this.listLoading = false
        this.list = data.list
      })
    },
    getIndex($index) {
      // 表格序号
      return $index + 1
    },
    showCreate() {
      // 显示新增对话框
      this.tempRole.roleName = ''
      this.tempRole.roleId = ''
      this.tempRole.permissions = []
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
    },
    showUpdate($index) {
      const role = this.list[$index]
      this.tempRole.roleName = role.roleName
      this.tempRole.roleId = role.roleId
      this.tempRole.permissions = []
      for (let i = 0; i < role.menus.length; i++) {
        const perm = role.menus[i].permissions
        for (let j = 0; j < perm.length; j++) {
          // console.log(perm[j])
          if (perm[j].children === 0) {
            this.tempRole.permissions.push(perm[j].permissionId)
          }
        }
      }
      this.defaultCheckedKeys = this.tempRole.permissions
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
    },
    createRole() {
      if (!this.checkRoleNameUnique()) {
        return
      }
      this.tempRole.permissions = this.$refs.tree.getCheckedKeys()
      if (!this.checkPermissionNum()) {
        return
      }
      // 添加新角色
      this.api({
        url: '/user/addRole',
        method: 'post',
        data: this.tempRole
      }).then(() => {
        this.getList()
        this.dialogFormVisible = false
      })
    },
    updateRole() {
      if (!this.checkRoleNameUnique(this.tempRole.roleId)) {
        return
      }
      this.tempRole.permissions = this.$refs.tree.getCheckedKeys()
      if (!this.checkPermissionNum()) {
        return
      }
      // 修改角色
      this.api({
        url: '/user/updateRole',
        method: 'post',
        data: this.tempRole
      }).then(() => {
        this.getList()
        this.dialogFormVisible = false
      })
    },
    checkPermissionNum() {
      // 校验至少有一种权限
      if (this.tempRole.permissions.length === 0) {
        this.$message.error('请至少选择一种权限')
        return false
      }
      return true
    },
    checkRoleNameUnique(roleId) {
      // 校验名称重复
      const roleName = this.tempRole.roleName
      if (!roleName) {
        this.$message.error('请填写角色名称')
        return false
      }
      const roles = this.list
      let result = true
      for (let j = 0; j < roles.length; j++) {
        if (roles[j].roleName === roleName && (!roleId || roles[j].roleId !== roleId)) {
          this.$message.error('角色名称已存在')
          result = false
          break
        }
      }
      return result
    },
    removeRole($index) {
      const _vue = this
      this.$confirm('确定删除此角色?', '提示', {
        confirmButtonText: '确定',
        showCancelButton: false,
        type: 'warning'
      }).then(() => {
        const role = _vue.list[$index]
        _vue.api({
          url: '/user/deleteRole',
          method: 'post',
          data: {
            roleId: role.roleId
          }
        }).then(() => {
          _vue.getList()
        }).catch(e => {
        })
      })
    }
  }
}
</script>
<style scoped>
  .requiredPermission {
    color: #ff0e13;
  }
</style>
