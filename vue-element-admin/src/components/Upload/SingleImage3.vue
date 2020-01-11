<template>
  <div class="upload-container">
    <el-upload
      :limit=limitNum
      :on-exceed="exceedFile"
      :before-upload="beforeUpload"
      :on-success="handleImageSuccess"
      class="image-uploader"
      :on-error="handleError"
      drag
      :action="postUrl"
    >
      <i class="el-icon-upload" />
      <div class="el-upload__text">
        将文件拖到此处，或<em>点击上传</em>
      </div>
    </el-upload>
    <div class="image-preview image-app-preview">
      <div v-show="imageUrl.length>1" class="image-preview-wrapper">
        <img :src="imageUrl">
        <div class="image-preview-action">
          <i class="el-icon-delete" @click="rmImage" />
        </div>
      </div>
    </div>
    <div class="image-preview">
      <div v-show="imageUrl.length>1" class="image-preview-wrapper">
        <img :src="imageUrl">
        <div class="image-preview-action">
          <i class="el-icon-delete" @click="rmImage" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'SingleImageUpload3',
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      postUrl: '',
      tempUrl: '',
      limitNum: 1
    }
  },
  created() {
    this.postUrl = process.env.VUE_APP_BASE_API + '/upload'
    // console.log('----------------------------')
    // console.log(this.postUrl)
    // console.log('----------------------------')
  },
  computed: {
    imageUrl() {
      return this.value
    }
  },
  methods: {
    rmImage() {
      this.emitInput('')
    },
    emitInput(val) {
      this.$emit('input', val)
    },
    exceedFile(files, fileList) {
      this.$notify.warning({
        title: '警告',
        message: '只能选择 ${this.limitNum} 个文件，当前共选择了 ${files.length + fileList.length} 个'
      })
    },
    handleImageSuccess(res, file, fileList) {
      this.emitInput(res.data)
      this.$message.success({
        title: '成功',
        message: `图片上传成功`
      })
    },
    handleError(file) {
      this.$message.error({
        title: '错误提示',
        message: '图片上传失败!'
      })
    },
    beforeUpload(file) {
      const imageSize = file.size / 1024 / 1024
      if (imageSize > 10) {
        this.$notify.warning({
          title: '警告',
          message: '文件大小不能超过10M'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";
.upload-container {
  width: 100%;
  position: relative;
  @include clearfix;
  .image-uploader {
    width: 35%;
    float: left;
  }
  .image-preview {
    width: 200px;
    height: 200px;
    position: relative;
    border: 1px dashed #d9d9d9;
    float: left;
    margin-left: 50px;
    .image-preview-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .image-preview-action {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      cursor: default;
      text-align: center;
      color: #fff;
      opacity: 0;
      font-size: 20px;
      background-color: rgba(0, 0, 0, .5);
      transition: opacity .3s;
      cursor: pointer;
      text-align: center;
      line-height: 200px;
      .el-icon-delete {
        font-size: 36px;
      }
    }
    &:hover {
      .image-preview-action {
        opacity: 1;
      }
    }
  }
  .image-app-preview {
    width: 320px;
    height: 180px;
    position: relative;
    border: 1px dashed #d9d9d9;
    float: left;
    margin-left: 50px;
    .app-fake-conver {
      height: 44px;
      position: absolute;
      width: 100%; // background: rgba(0, 0, 0, .1);
      text-align: center;
      line-height: 64px;
      color: #fff;
    }
  }
}
</style>
