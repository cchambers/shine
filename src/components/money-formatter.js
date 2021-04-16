const UtagBehavior = {
  methods: {
    format(money) {
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      });
      return formatter.format(money);
    },
  },
};

export default UtagBehavior;