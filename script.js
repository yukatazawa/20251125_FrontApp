// ==============================
// Axios共通設定
// ==============================
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "https://backapp-yukatazawa.m3harbor.net/api"; // バックエンドのカスタムドメイン

// ==============================
// Vueアプリ設定
// ==============================
const { createApp, ref, onMounted } = Vue;
const { createVuetify } = Vuetify;
const vuetify = createVuetify();

createApp({
  setup() {
    // ------------------------------
    // 変数定義
    // ------------------------------
    const ID = ref('');
    const Name = ref('');
    const dataList = ref([]);
    const dialog = ref(false);
    const message = ref('');
    const loading = ref(false);

    // ------------------------------
    // ページ初期化時にセッション確認
    // ------------------------------
    onMounted(async () => {
      await checkSession();
    });

    // ------------------------------
    // セッション確認処理
    // ------------------------------
    const checkSession = async () => {
      loading.value = true;
      try {
        const res = await axios.get('/CHECKSESSION');
        console.log("CHECKSESSION:", res.data);

        if (res.data.status === 'active') {
          message.value = "セッションは有効です。\n残り時間3分以内に操作してください。";
        } else {
          message.value = "セッションが無効です。\nログインページへ移動します。";
          setTimeout(() => window.location.href = 'index.html', 2000);
        }
      } catch (err) {
        message.value = "セッション確認エラー：" + (err.response?.data || err.message);
        setTimeout(() => window.location.href = 'index.html', 2000);
      } finally {
        dialog.value = true;
        loading.value = false;
      }
    };

    // ------------------------------
    // ログアウト処理
    // ------------------------------
    const logout = async () => {
      loading.value = true;
      try {
        await axios.post('/LOGOUT');
        message.value = "ログアウトしました。\nログインページに戻ります。";
        dialog.value = true;
        setTimeout(() => window.location.href = 'index.html', 1500);
      } catch (err) {
        message.value = "ログアウトに失敗しました。";
        dialog.value = true;
      } finally {
        loading.value = false;
      }
    };

    // ------------------------------
    // DB登録処理
    // ------------------------------
    const addData = async () => {
      if (!ID.value || isNaN(ID.value)) {
        message.value = 'IDに数値を入力してください。';
        dialog.value = true;
        return;
      }

      const param = { ID: ID.value, Name: Name.value };
      try {
        const res = await axios.post('/INSERT', param);
        message.value = res.data;
      } catch (err) {
        message.value = '通信エラー：' + err.message;
      } finally {
        dialog.value = true;
      }
    };

    // ------------------------------
    // DB読取処理
    // ------------------------------
    const readData = async () => {
      try {
        const res = await axios.get('/SELECT');
        dataList.value = res.data.List;
      } catch (err) {
        message.value = 'データ取得に失敗しました。';
        dialog.value = true;
      }
    };

    return {
      ID,
      Name,
      dataList,
      dialog,
      message,
      loading,
      checkSession,
      logout,
      addData,
      readData,
    };
  },
})
  .use(vuetify)
  .mount('#app');