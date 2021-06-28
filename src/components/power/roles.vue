<template>
  <div>
<!--    面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

<!--    卡片视图-->
    <el-card>
<!--      添加角色按钮-->
<!--      行-->
      <el-row>
<!--        列-->
        <el-col>
          <el-button type="primary" @click="addDialogVisible=true" @close="addDialogClosed">添加角色</el-button>
        </el-col>
      </el-row>

<!--      角色列表区域-->
      <el-table :data="roleList" border stripe>
<!--        展开列-->
        <el-table-column type="expand">
          <template slot-scope="scope">

            <el-row :class="['bdbottom',li===0?'bdtop':'','vcenter']" v-for="(item1,li) in scope.row.children" :key="item1.id">
<!--              渲染一级权限-->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
<!--              渲染二级，三级权限-->
              <el-col :span="19">
<!--               通过for循环 嵌套渲染二级权限 -->
                <el-row v-for="(item2,l2) in item1.children" :key="item2.id" :class="[l2===0?'':'bdtop','vcenter']">
                  <el-col :span="6">
                    <el-tag type="success"  closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" v-for="(item3,l3) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row,item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
<!--           <pre> {{scope.row}}</pre>-->
          </template>
         </el-table-column>
<!--      索引列  -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button  @click="showEditDialog(scope.row.id)" type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button @click="removeUserById(scope.row.id)" type="danger" icon="el-icon-delete" size="mini" >删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>

      </el-table>
    </el-card>

<!--    添加角色-->
    <el-dialog
      title="添加角色"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed">
      <!--      内容主体区-->
      <el-form :model="addForm" :rules="addFormRules"  ref="addFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!--      底部区域-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
    </el-dialog>

    <!--修改角色-->
    <el-dialog
      title="修改角色"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="80px">
        <!--        用户名-->
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName" ></el-input>
        </el-form-item>
        <!--         描述信息-->
        <el-form-item label="角色描述">
          <el-input v-model="editForm.roleDesc" ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserInfo">确 定</el-button>
  </span>
    </el-dialog>

<!--    分配权限-->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
<!--      树形控件-->
      <el-tree :default-checked-keys="defKeys" default-expand-all node-key="id" show-checkbox :data="rightslist" :props="treeProps" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 认</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import rights from "./rights";

  export default{
    data(){
      return{
        //所有角色列表数组
        roleList:[],
        //控制权限对话框的显示与隐藏
        setRightDialogVisible: false,
        //添加对话框的显示与隐藏
        addDialogVisible:false,
        //添加用户的表单数据
        addForm:{
          roleName:'',
          roleDesc:''
        },
        addFormRules:{
          roleName:[
            {required:true,message:'角色名称不能为空',trigger:'blur'},
          ]
        },
        //修改对话框的显示与隐藏
        editDialogVisible:false,
        //查询道德用户对象
        editForm:{},
        // 获取权限数据
        rightslist:[],
        //数形控件的属性绑定
        treeProps:{
          label:'authName',
          children:'children'
        },
        //默认选中的节点
        defKeys:[],
        //当前分配权限的角色id
        roleId:[]

      }

    },
    created() {
      this.getRolesList()
    },
    methods:{
       async getRolesList(){
        const {data: res} = await this.$http.get('roles')
        if (res.meta.status !== 200){
          return  this.$message.error('获取角色列表失败！')
        }
        this.roleList = res.data
         console.log(this.roleList)
      },
      //监听添加用户对话框的关闭事件
      addDialogClosed(){
        this.$refs.addFormRef.resetFields()
      },
      //点击按钮添加新用户
      addUser(){
        this.$refs.addFormRef.validate( async valid =>{
          //判断是否添加成功
          if (!valid) return  //失败直接返回
          //成功直接添加用户的网络请求
          const { data:res}=await this.$http.post('roles',this.addForm)
          if (res.meta.status !==201){
           return  this.$message.error('添加角色失败')
          }
          this.$message.success('添加角色成功')
          //隐藏添加用户的对话框
          this.addDialogVisible = false
          //重新获取用户列表数据
          this.getRolesList()
        })
      },


      //展示编辑用户对话框
      async showEditDialog(id){
        // console.log(id)
        const {data:res} = await this.$http.get('roles/'+id)
        if (res.meta.status !==200){
          return this.$message.error('查询角色信息失败')
        }
        this.editForm = res.data
        this.editDialogVisible = true
      },
      //监听修改用户对话框的关闭事件
      editDialogClosed(){
        this.$refs.editFormRef.resetFields()
      },
      //修改用户信息并提交
      editUserInfo(){
        this.$refs.editFormRef.validate( async valid =>{
          // console.log(valid)
          // console.log(this.editForm)
          if (!valid) return
          //发送修改用户信息的数据请求
          const {data:res}=await this.$http.put('roles/'+this.editForm.roleId,{roleName:this.editForm.roleName,roleDesc:this.editForm.roleDesc})
          if (res.meta.status !== 200){
            return this.$message.error('更新角色信息失败')

          }
          //关闭对话框
          this.editDialogVisible = false
          // 刷新数据列表
          this.getRolesList()
          //提示修改成功
          this.$message.success('更新角色信息成功！')
        })
      },

      //根据id删除对应信息
      async removeUserById(id){
        // console.log(id)
        //弹框询问用户是否删除
        const  confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
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
        const {data:res} = await this.$http.delete('roles/'+id)
        if (res.meta.status !==200){
          return this.$message.error('删除角色失败')
        }
        this.$message.success('删除角色成功')
        this.getRolesList()
      },
    //  根据id删除对应的权限
       async removeRightById(role,rightId){
        //弹框询问用户是否删除
        const  confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
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
        const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !==200){
          return this.$message.error('删除权限失败')
        }
        this.$message.success('删除权限成功')
         role.children = res.data
      },

      //展示分配权限对话框
      async showSetRightDialog(role){
         this.roleId = role.id
         //获取所有权限的数据
         const {data:res} = await this.$http.get('rights/tree')
        if (res.meta.status !== 200){
          return this.$message.error('获取用户权限失败！')
        }
        //把获取到的权限数据保存到data中
        this.rightslist = res.data
        // console.log(this.rightslist)

        //递归获得当前节点的id
        this.getLeafKeys(role,this.defKeys)


        this.setRightDialogVisible = true
      },

    //  通过递归的形式把获取的所有三级权限的id，保存到defKeys中
      getLeafKeys(node,arr){
         //如果当前node 的节点不包括children 属性，则是三级节点
        if(!node.children){
          return arr.push(node.id)
        }

        node.children.forEach(item => this.getLeafKeys(item, arr))
      },

    //  监听分配权限对话框的关闭事件
      setRightDialogClosed(){
         this.defKeys = []
      },

    //  点击确定分配权限
      async allotRights(){
         const keys = [
         ...this.$refs.treeRef.getCheckedKeys(),
         ...this.$refs.treeRef.getHalfCheckedKeys()
          ]
        const idStr = keys.join(',')
        const {data:res}= await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
        if (res.meta.status !== 200){
          return this.$message.error('分配权限失败！')
        }
        this.$message.success('分配权限成功')
        this.getRolesList()
        this.setRightDialogVisible = false
      },


    }
  }
</script>

<style lang="less" scoped>
  .el-tag{
  margin: 7px;
}
  .bdtop{
    border-top: 1px solid #eee;
  }
  .bdbottom{
    border-bottom: 1px solid #eee;
  }
  .vcenter{
    display: flex;
    align-items: center;
  }

</style>
