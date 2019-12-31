<template>
  <div class="app-container">
    <!--    <div class="filter-container">-->
    <!--      <el-form>-->
    <!--        <el-form-item>-->
    <!--          <el-button type="primary" icon="plus" v-if="hasPerm('group:add')" @click="showCreate">添加-->
    <!--          </el-button>-->
    <!--        </el-form-item>-->
    <!--      </el-form>-->
    <!--    </div>-->
    <el-table
      v-loading.body="listLoading"
      :data="list"
      stripe
      empty-text="-"
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
      <el-table-column align="center" label="方法名称" prop="actionMethod" style="width: 60px;" />
      <el-table-column align="center" label="访问路径" prop="actionUrl" width="150" />
      <el-table-column align="center" label="访问ip" prop="requestIp" width="100" />
      <el-table-column align="center" :show-overflow-tooltip="true" label="参数" prop="params" width="150" />
      <el-table-column align="center" label="用户名" prop="userName" width="150" />
      <el-table-column align="center" label="用户id" prop="userId" width="150" />
      <el-table-column align="center" label="开始时间" prop="startTime" width="100" />
      <el-table-column align="center" label="结束时间" prop="finishTime" width="150" />
      <el-table-column align="center" :show-overflow-tooltip="true" label="执行结果" prop="exDetail" width="150" />
    </el-table>
    <el-pagination
      :current-page="listQuery.page"
      :page-size="listQuery.pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>
<script>

export default {
  data() {
    return {
      total: 0, // 分页组件--数据总条数
      list: [], // 表格的数据
      listLoading: false, // 数据加载等待动画
      listQuery: {
        page: 1, // 页码
        pageSize: 20// 每页条数
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      // 查询列表
      this.listLoading = true
      this.api({
        url: '/syslog/list',
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
    }
  }
}
</script>
