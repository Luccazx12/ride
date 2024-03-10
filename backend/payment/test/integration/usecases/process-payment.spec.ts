interface Subject {
  processPayment: ProcessPayment;
  paymentRepository: PaymentRepository;
  paymentGateway: PaymentGateway;
}

const createSubject = (): Subject => {
  const paymentRepository = new InMemoryPaymentRepository();
  const paymentGateway = new PaymentGatewayStub();
  const processPayment = new ProcessPayment(paymentRepository, paymentGateway);
  return {
    processPayment,
    paymentGateway,
    paymentRepository,
  };
};

describe("ProcessPayment", async () => {
  it("should process an payment order", async () => {
    // given
    const { processPayment, paymentRepository, paymentGateway } =
      createSubject();
    const input = new ProcessPaymentInputBuilder().build();
    paymentGateway.transfer = jest.fn();

    // when
    await processPayment.execute(input);

    // then
    expect(paymentGateway.transfer).toBeCalled();
    const paymentsByRideId = await paymentRepository.listByRideId(input.rideId);
    expect(paymentsByRideId.length > 0).toBeTruthy();
  });
});
