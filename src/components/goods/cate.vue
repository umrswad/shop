<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

<!--    卡片视图区域-->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

<!--      表格-->
      <tree-table class="treeTable" :data="catelist" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" border >
<!--      是否有效模板  -->
        <template v-slot:isok="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: #6ec07a"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
<!--        排序模板-->
        <template v-slot:order="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
<!--        操作模板-->
        <template v-slot:opt="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="editCateDialog(scope.row.cat_id)" >编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>

<!--      分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

<!--    添加分类对话框-->
    <el-dialog
      title="添加分类"
      :visible.sync="addCatedialogVisible"
      width="50%" @close="addCateDialogclosed">
<!--      添加分类表单-->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
<!--          options用来指定数据对象-->
          <el-cascader
            v-model="selectedKeys"
            :options=" parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged" clearable></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addCatedialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
    </el-dialog>

<!--    修改编辑-->
    <el-dialog
      title="编辑商品"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateRef" label-width="100px">
        <!--        用户名-->
        <el-form-item label="商品名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name" ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editok()">确 定</el-button>
  </span>
    </el-dialog>,
  </div>
</template>

<script>
  export default {
    data(){
      return {
        //查询条件
        querInfo:{
          type:3,
          pagenum:1,
          pagesize:5
        },
        //商品分类数据列表，默认为空
        catelist:[],
        //总数据条数
        total:0,
        //为table指定列的定义
        columns:[
          {
            label:'分类名称',
            prop:'cat_name'
          },
          {
            label:'是否有效',
            //表示当前定义的模板列
            type:'template',
            //表示当前这一切使用的模板名称
            template:'isok'
          },
          {
            label:'排序',
            //表示当前定义的模板列
            type:'template',
            //表示当前这一切使用的模板名称
            template:'order'
          },
          {
            label:'操作',
            //表示当前定义的模板列
            type:'template',
            //表示当前这一切使用的模板名称
            template:'opt'
          }
        ],
        //控制对话框的显示与隐藏
        addCatedialogVisible:false,
        //添加分类表单数据对象
        addCateForm:{
          //将要添加的分类名称
          cat_name:'',
          //父id
          cat_pid:0,
          //分类等级,默认添加一级分类
          cat_level:0
        },
        //将要添加的分类名称的表单验证规则
        addCateFormRules:{
          cat_name:[
            { required:true, message:'请输入分类名称', trigger:'blur'}
          ]
        },
        //父级分类的列表
        parentCateList:[],
        //指定级联选择器的配置对象
        cascaderProps:{
        expandTrigger: 'hover',
        value:'cat_id',
        label:'cat_name',
        children:'children',
        checkStrictly:true
      },
        //选中的父级分类的id数组
        selectedKeys:[],

        // 编辑对话框传递参数
        editCateForm:{
          cat_name:''
        },
        //编辑对话框规则
        editCateFormRules:{
          cat_name:[
            { required:true, message:'请输入分类名称', trigger:'blur'}
          ]
        },
        editDialogVisible:false


      }
    },
    created() {
      this.getCateList()
    },
    methods:{
      //获取商品分类数据
      async getCateList() {
        const {data:res} =await this.$http.get('categories', {params:this.querInfo})
        if (res.meta.status !==200){
          return this.$message.error('获取商品列表失败！')
        }
        //把数据列表复制给catelist
      this.catelist = res.data.result
        this.total = res.data.total
      },
      //监听 pagesize改变
      handleSizeChange(newSize){
        this.querInfo.pagesize = newSize
        this.getCateList()
      },
      //监听pagenum改变
      handleCurrentChange(newPage){
        this.querInfo.pagenum = newPage
        this.getCateList()
      },
      //点击按钮，展示添加分类的对话框
      showAddCateDialog(){
        //先获取父级分类的数据库列表
        this.getParentCateList()
        //展示对话框
        this.addCatedialogVisible = true
      },
      //获取父级分类的数据列表
      async getParentCateList(){
        const {data:res}=await this.$http.get('categories',{params:{type:2}})

       if (res.meta.status !==200){
         return  this.$message.error('获取父级数据失败！')
       }
       this.parentCateList = res.data
      },
      //选择项发生变化触发这个函数
      parentCateChanged(){
        // console.log(this.selectedKeys)
      //  如果selectedKeys的数组中的length大于0，证明选中的父级分类
      //  反之，就说明没有选中父级分类
        if(this.selectedKeys.length>0){
          //父级分类id
          this.addCateForm.cat_pid = this.selectedKeys[
            this.selectedKeys.length-1
            ]
          //为当前分类的等级赋值
          this.addCateForm.cat_level = this.selectedKeys.length
          return
        }else {
          //父级分类id
          this.addCateForm.cat_pid = 0
          //为当前分类的等级赋值
          this.addCateForm.cat_level = 0
        }
      },
      //点击按钮添加新的分类
      addCate(){
        // console.log(this.addCateForm)
        this.$refs.addCateFormRef.validate(async valid=>{
          if (!valid) return
          const {data:res} = await this.$http.post('categories',this.addCateForm)
          if (res.meta.status !==201){
            return this.$message.error('添加分类失败！')
          }

          this.$message.success('添加分类成功')
          this.getCateList()
          this.addCatedialogVisible = false
        })
      },
      //监听对话框的关闭事件，重置表单数据
      addCateDialogclosed(){
        this.$refs.addCateFormRef.resetFields()
        this.selectedKeys=[]
        this.addCateForm.cat_level = 0
        this.addCateForm.cat_pid = 0
      },
      // 监听编辑对话框的打开事件
      async editCateDialog(id){
        // console.log()
        const {data:res} = await this.$http.get('categories/'+id)
        if (res.meta.status !==200){
          return this.$message.error('查询商品信息失败')
        }
        this.editCateForm= res.data
        this.editDialogVisible = true
        // console.log(this.editCateForm)
      },
      //编辑对话框确认提交按钮事件
      editok(){
        this.$refs.editCateRef.validate( async valid =>{
          // console.log(valid)
          if (!valid) return
          //发送修改用户信息的数据请求
          const {data:res}=await this.$http.put('categories/'+this.editCateForm.cat_id,{cat_name:this.editCateForm.cat_name})
          if (res.meta.status !==200){
            return this.$message.error('更新商品信息失败')
          }
          //关闭对话框
          this.editDialogVisible = false
          // 刷新数据列表
          this.getCateList()
          console.log(res.data.cat_name)

          //提示修改成功
          this.$message.success('更新用户信息成功！')
        })
      },
      //监听编辑对话框的关闭事件
      editDialogClosed(){
        this.$refs.editCateRef.resetFields()
      },
      //删除功能
      async removeCate(id){
        const  confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        // 如果用户确认删除，则返回值为字符串
        //如果用户取消删除。返回值为字符串cancel
        // console.log(confirmResult)
        if (confirmResult !=='confirm'){
          return this.$message.info('已取消删除')
        }
        // console.log('确认了删除')
        const {data:res} = await this.$http.delete('categories/'+id)
        if (res.meta.status !==200){
          return this.$message.error('删除商品失败')
        }
        this.$message.success('删除删除成功')
        this.getCateList()
      }
    }
  }
</script>

<style lang="less" scoped>
  .treeTable{
    margin-top: 15px;
  }
  .el-cascader{
    width: 100%;
  }
</style>
