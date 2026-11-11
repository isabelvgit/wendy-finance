
const WendyStorage = {
    chave: "wendy_finance_v1",

    obterVendas() {
        try {
            return JSON.parse(
                localStorage.getItem(this.chave)
            ) || [];
        } catch {
            return [];
        }
    },

    salvarVendas(vendas) {
        localStorage.setItem(
            this.chave,
            JSON.stringify(vendas)
        );
    }
};
