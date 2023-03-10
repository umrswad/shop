// vue.config.js
module.exports = {
  lintOnSave: false,
  chainWebpack:config =>{
    //发布模式
    config.when(process.env.NODE_ENV ==='production',config =>{
     config.entry('app').clear().add('./src/main-prod.js')
      config.set('externals',{
        vue: 'Vue',
        'vue-router':'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
        onprogress: 'Nprogress',
        'vue-quill-editor': 'VueQuillEditor'
      })
      config.plugin('html').tap(args=>{
        //添加参数isProd
        args[0].isProd = true
        return args
      })

    })
    //开发模式
    config.when(process.env.NODE_ENV ==='development',config =>{
      config.entry('app').clear().add('./src/main-dev.js')

      config.plugin('html').tap(args=>{
        //添加参数isProd
        args[0].isProd = false
        return args
      })
    })
  }
}
