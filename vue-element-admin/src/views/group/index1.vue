<template>
  <div>
    Hello World!
  </div>
<!--  <div class="app-container">-->
<!--    <div class="filter-container">-->
<!--      <el-form>-->
<!--        <el-form-item>-->
<!--          <el-button v-if="hasPerm('group:add')" type="primary" icon="plus" @click="showCreate">添加-->
<!--          </el-button>-->
<!--        </el-form-item>-->
<!--      </el-form>-->
<!--    </div>-->
<!--    <el-table-->
<!--      v-loading.body="listLoading"-->
<!--      :data="list"-->
<!--      element-loading-text="拼命加载中"-->
<!--      stripe-->
<!--      border-->
<!--      fit-->
<!--      highlight-current-row-->
<!--    >-->
<!--      <el-table-column align="center" label="序号" width="80">-->
<!--        <template slot-scope="scope">-->
<!--          <span v-text="getIndex(scope.$index)" />-->
<!--        </template>-->
<!--      </el-table-column>-->
<!--      <el-table-column align="center" label="组织名称" prop="groupName" style="width: 60px;" />-->
<!--      <el-table-column align="center" label="是否可用" style="width: 90px;">-->
<!--        <template slot-scope="scope">-->
<!--          <el-tag v-if="scope.row.isValid === 1" type="success" text="可用">可用</el-tag>-->
<!--          <el-tag v-else type="primary" text="禁用">不可用</el-tag>-->
<!--        </template>-->
<!--      </el-table-column>-->
<!--      <el-table-column align="center" label="组织描述" prop="description" width="150" />-->
<!--      <el-table-column align="center" label="创建人" prop="createUserName" width="100" />-->
<!--      <el-table-column align="center" label="创建时间" prop="createTime" width="150" />-->
<!--      <el-table-column align="center" label="修改人" prop="updateGroupName" width="100" />-->
<!--      <el-table-column align="center" label="最近修改时间" prop="updateTime" width="150" />-->
<!--      <el-table-column align="center" label="管理" width="220">-->
<!--        <template slot-scope="scope">-->
<!--          <el-button v-if="hasPerm('group:update')" type="primary" icon="edit" @click="showUpdate(scope.$index)">修改</el-button>-->
<!--          <el-button-->
<!--            v-if="hasPerm('group:forbidden') && scope.row.isValid === 1"-->
<!--            type="danger"-->
<!--            icon="delete"-->
<!--            @click="forbiddenGroup(scope.$index)"-->
<!--          >禁用-->
<!--          </el-button>-->
<!--          <el-button-->
<!--            v-if="hasPerm('group:open') && scope.row.isValid === 0"-->
<!--            type="danger"-->
<!--            icon="delete"-->
<!--            @click="openGroup(scope.$index)"-->
<!--          >启用-->
<!--          </el-button>-->
<!--        </template>-->
<!--      </el-table-column>-->
<!--    </el-table>-->
<!--    <el-pagination-->
<!--      :current-page="listQuery.page"-->
<!--      :page-size="listQuery.pageSize"-->
<!--      :total="total"-->
<!--      :page-sizes="[10, 20, 50, 100]"-->
<!--      layout="total, sizes, prev, pager, next, jumper"-->
<!--      @size-change="handleSizeChange"-->
<!--      @current-change="handleCurrentChange"-->
<!--    />-->
<!--    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">-->
<!--      <el-form-->
<!--        class="small-space"-->
<!--        :model="tempGroup"-->
<!--        label-position="left"-->
<!--        label-width="80px"-->
<!--        style="width: 300px; margin-left:50px;"-->
<!--      >-->
<!--        <el-form-item v-if="dialogStatus=='create'" label="组织名称" required>-->
<!--          <el-input v-model="tempGroup.groupName" type="text" />-->
<!--        </el-form-item>-->
<!--        <el-form-item v-else label="组织名称">-->
<!--          <el-input v-model="tempGroup.groupName" type="text" disabled />-->
<!--        </el-form-item>-->
<!--        <el-form-item label="组织描述" required>-->
<!--          <el-input v-model="tempGroup.description" type="textarea" :rows="2" />-->
<!--        </el-form-item>-->
<!--      </el-form>-->
<!--      <div slot="footer" class="dialog-footer">-->
<!--        <el-button @click="dialogFormVisible = false">取 消</el-button>-->
<!--        <el-button v-if="dialogStatus=='create'" type="success" @click="createGroup">创 建</el-button>-->
<!--        <el-button v-else type="primary" @click="updateGroup">修 改</el-button>-->
<!--      </div>-->
<!--    </el-dialog>-->
<!--  </div>-->
</template>

<script>

export default {
  name: 'Group',
  data() {
    return {
      total: 0, // 分页组件--数据总条数
      list: [], // 表格的数据
      listLoading: false, // 数据加载等待动画
      listQuery: {
        page: 1, // 页码
        pageSize: 50// 每页条数
      },
      roles: [], // 角色列表
      dialogStatus: 'create',
      dialogFormVisible: false,
      textMap: {
        update: '编辑',
        create: '新建组织'
      },
      tempGroup: {
        groupName: '',
        description: '',
        id: '',
        isValid: 1,
        createTime: '',
        updateTime: '',
        createUserId: '',
        updateUserId: '',
        createUserName: '',
        updateUserName: ''
      }
    }
  },
  created() {
    this.getList()
    // if (this.hasPerm('group:add') || this.hasPerm('group:update')) {
    //   this.getAllGroups();
    // }
  },
  // computed: {
  //   ...mapGetters([
  //     'userId'
  //   ])
  // },
  methods: {
    // getAllGroups() {
    //   this.api({
    //     url: "/group/list",
    //     method: "get"
    //   }).then(data => {
    //     this.roles = data.list;
    //   })
    // },
    getList() {
      // 查询列表
      this.listLoading = true
      this.api({
        url: '/group/list',
        method: 'get',
        params: this.listQuery
      }).then(data => {
        this.listLoading = false
        this.list = data.data.records
        this.total = parseInt(data.data.total)
      })
    },
    handleSizeChange(val) {
      // 改变每页数量
      this.listQuery.pageSize = val
      this.handleFilter()
    },
    handleCurrentChange(val) {
      // 改变页码
      this.listQuery.page = val
      this.getList()
    },
    handleFilter() {
      // 查询事件
      this.listQuery.page = 1
      this.getList()
    },
    getIndex($index) {
      // 表格序号
      return (this.listQuery.page - 1) * this.listQuery.pageSize + $index + 1
    },
    showCreate() {
      // 显示新增对话框
      this.tempGroup.groupName = ''
      this.tempGroup.description = ''
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
    },
    showUpdate($index) {
      const group = this.list[$index]
      this.tempGroup.description = group.description
      this.tempGroup.groupName = group.groupName
      this.tempGroup.id = group.id
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
    },
    createGroup() {
      // 添加新组织
      this.api({
        url: '/group/save',
        method: 'post',
        data: this.tempGroup
      }).then(() => {
        this.getList()
        this.dialogFormVisible = false
      })
    },
    updateGroup() {
      // 修改组织信息
      this.api({
        url: '/group/update',
        method: 'post',
        data: this.tempGroup
      }).then(() => {
        const msg = '修改成功'
        this.dialogFormVisible = false
        this.$message({
          message: msg,
          type: 'success',
          duration: 1 * 1000,
          onClose: () => {
            this.getList()
          }
        })
      })
    },
    forbiddenGroup($index) {
      this.$confirm('确定禁用此组织?', '提示', {
        confirmButtonText: '确定',
        showCancelButton: false,
        type: 'warning'
      }).then(() => {
        const group = this.list[$index]
        const params = new URLSearchParams()
        params.append('groupId', group.id)

        this.api({
          url: '/group/forbidden',
          method: 'get',
          params: params
        }).then(() => {
          this.getList()
        }).catch(() => {
          this.$message.error('禁用失败')
        })
      })
    },
    openGroup($index) {
      this.$confirm('确定启用此组织?', '提示', {
        confirmButtonText: '确定',
        showCancelButton: false,
        type: 'warning'
      }).then(() => {
        const group = this.list[$index]
        const params = new URLSearchParams()
        params.append('groupId', group.id)

        this.api({
          url: '/group/open',
          method: 'get',
          params: params
        }).then(() => {
          this.getList()
        }).catch(() => {
          this.$message.error('启用失败')
        })
      })
    }
  }
}
</script>
