<template>
  <div>
    <!--    面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
<!--    卡片视图-->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList" @input="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>

<!--     table表格区域 -->
      <el-table :data="goodslist" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price"width="95px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit"@click="goodsEditDialog(scope.row.goods_id)"></el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeById(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
<!--      分页功能-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

<!--    修改-->
    <el-dialog
      title="提示"
      :visible.sync="dialogVisible"
      @close="editDialogClosed"
      width="50%">
<!--      <span>此接口api有问题</span>-->
      <el-form :model="goodsForm" :rules="goodsFormRules" ref="goodsFormRef" label-width="80px">
        <!--        商品-->
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="goodsForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="goodsForm.goods_price" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="goodsForm.goods_weight" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_number">
          <el-input v-model="goodsForm.goods_number" type="number"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editgoods">确 定</el-button>
  </span>
    </el-dialog>


  </div>
</template>

<script>
  export default {
    data(){
      return{
        //查询参数对象
        queryInfo:{
          query:'',
          //当前页数
          pagenum:1,
          //当前每页显示多少条数据
          pagesize:10
        },
        //商品列表
        goodslist:[],
        //总数据条数
        total:0,
      //  修改
        dialogVisible:false,
        //商品名称
        goodsForm:{
          goods_name:'',
          goods_price:'',
          goods_number:'',
          goods_weight:''
        },
        //商品规则
        goodsFormRules:{
          goods_name:[
            {required:true,message:'请输入商品名称',trigger:'blur'}
          ],
          goods_price:[
            {required:true,message:'请输入数字',trigger:'blur'}
          ],
          goods_number:[
            {required:true,message:'请输入数字',trigger:'blur'}
          ],
          goods_weight:[
            {required:true,message:'请输入数字',trigger:'blur'}
          ]
        }
      }


    },

    created() {
      this.getGoodsList()
    },

    methods:{
      // 根据分页获取对应的商品列表
       async getGoodsList(){
        const {data:res} = await this.$http.get('goods',{params: this.queryInfo})

         if (res.meta.status !==200){
           return  this.$message.error('获取商品列表失败！')
         }
         // this.$message.success('获取商品列表成功')
         // console.log(res.data)
         this.goodslist = res.data.goods
         this.total = res.data.total
      },
      //监听pagesie改变当前页数
      handleSizeChange(newSize){
        // console.log(newSize)
        this.queryInfo.pagesize = newSize
        this.getGoodsList()
      },
      //监听页码值改变事件
      handleCurrentChange(newPage){
        // console.log(newPage)
        this.queryInfo.pagenum = newPage
        this.getGoodsList()
      },
      //删除商品
       async removeById(id){
        //弹框询问用户是否删除
        const  confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
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
        const {data:res} = await this.$http.delete(`goods/${id}`)
        if (res.meta.status !==200){
          return this.$message.error('删除商品失败')
        }
        this.$message.success('删除商品成功')
        this.getGoodsList()
      },
    //  修改(有问题)
      async goodsEditDialog(id){
         console.log(id)
        this.dialogVisible = true
        const {data:res} = await this.$http.get(`goods/${id}`)
        if (res.meta.status !==200){
          return this.$message.error('查询商品信息失败')
        }
        this.goodsForm = res.data
        console.log(this.goodsForm)
      },
      // 关闭后重置
      editDialogClosed(){
        this.$refs.goodsFormRef.resetFields()
      },
      editgoods(){
        this.$refs.goodsFormRef.validate( async valid =>{
          if (!valid) return
          const {data:res} = await this.$http.put('goods/'+this.goodsForm.goods_id,{ goods_name:this.goodsForm.goods_name,
            goods_price:this.goodsForm.goods_price,
            goods_number:this.goodsForm.goods_number,
            goods_weight:this.goodsForm.goods_weight})
          if (res.meta.status !==201){
            return this.$message.error('修改商品失败！')
          }
          this.$message.success('修改商品成功！')
          this.dialogVisible = false
          this.getGoodsList()
        })
      },
      //添加
      goAddpage(){
         this.$router.push('/goods/add')
      }
    }
  }
</script>

<style lang="less">

</style>
