<template>
  <div id="app">
    <div class="loading" v-if="isLoading">
      loading...
    </div>
    <form action="javascript:;" class="login">
      <h1>登录</h1>
      <div class="login-p">
        <input type="text" placeholder="用户名" v-model="username">
      </div>
      <div class="login-p">
        <input type="password" placeholder="密码" v-model="password" @keyup.enter="submit">
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
@import (less) '../style/reset.css';

html {
  box-sizing: border-box;
}

body {
  background: #1FC8DB;
  min-height: 100%;
}

.login {
  width: 400px;
  margin: 0 auto;
  background: #fff;
  border: 1px solid #ddd;
  box-shadow: 0 0 10px 0 #000;
  padding: 20px;
  border-radius: 5px;
  margin-top: 100px;

  h1 {
    text-align: center;
    font-size: 20px;
    padding-bottom: 20px;
  }

  .login-p {
    margin-bottom: 20px;
  }

  input {
    background-color: #fff;
    border: 1px solid #d3d6db;
    border-radius: 3px;
    display: inline-flex;
    width: 100%;
    height: 32px;
    align-items: center;
    padding: 5px 10px;
  }

  button {
    display: inline-flex;
    background-color: #97cd76;
    border: 1px solid transparent;
    color: #fff;
    width: 100%;
    height: 32px;
    align-items: center;
    border-radius: 3px;
    text-align: center;
    justify-content: center;
    cursor: pointer;
  }
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
