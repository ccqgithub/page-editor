<template>
  <div id="app">
    <div class="loading" v-if="isLoading">
      loading...
    </div>
    <form action="" class="login">
      <div class="login-p">
        <input type="text" placeholder="用户名" v-model="username">
      </div>
      <div class="login-p">
        <input type="password" placeholder="密码" v-model="password">
      </div>
      <div class="login-p">
        <button type="button" name="button" :disabled="!canSubmit" @click="submit">提交</button>
      </div>
    </form>
  </div>
</template>

<script>
import $ from 'jquery';

export default {
  data() {
    return {
      isLoading: false,
      username: '',
      password: '',
    };
  },
  computed: {
    canSubmit() {
      return this.username.trim() && this.password.trim();
    }
  },
  methods: {
    submit() {
      this.isLoading = true;
      $.ajax({
        url: '/api/login',
        type: 'post',
        data: {
          username: this.username.trim(),
          password: this.password.trim(),
        }
      }).done(function(data) {
        this.isLoading = false;
        if (data.status != 200) {
          alert(data.message);
          return;
        }
        window.location.href = '/';
      }.bind(this))
      .fail(function(error) {
        this.isLoading = false;
        alert('网络错误');
      }.bind(this));
    }
  },
  mounted: function() {

  }
}
</script>

<style lang="less">
.login {
  padding: 50px;
  width: 400px;
  margin: 0 auto;
}
.loading{
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  z-index: 11;
  background: rgba(0, 0, 0, 0.5);
  padding: 50px;
  text-align: center;
  color: #fff;
}

</style>
