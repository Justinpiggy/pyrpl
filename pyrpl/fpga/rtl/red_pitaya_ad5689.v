module red_pitaya_ad5689 (
   // ADC
   input                 clk_i           ,  // clock
   input                 rstn_i          ,  // reset - active low
   // 14bit DAC data inputs
   input      [ 14-1: 0] data0_i          ,
   input      [ 14-1: 0] data1_i          ,  
   
   // AD5689 SPI interface
   output reg              dac_sclk        ,
   output reg              dac_sdin        ,
   output reg              dac_syncn       ,
   output reg              dac_ldacn       ,
   output reg              dac_rstn        ,
   input                   dac_sdo         ,

   // system bus
   input      [ 32-1: 0] sys_addr        ,  // bus address
   input      [ 32-1: 0] sys_wdata       ,  // bus write data
   input      [  4-1: 0] sys_sel         ,  // bus write byte select
   input                 sys_wen         ,  // bus write enabl
   input                 sys_ren         ,  // bus read enable
   output reg [ 32-1: 0] sys_rdata       ,  // bus read data
   output reg            sys_err         ,  // bus error indicator
   output reg            sys_ack            // bus acknowledge signal
);


// always @(posedge clk_i)
// if (rstn_i == 1'b0) begin
//    dac_a_o     <= 24'h000000 ;
//    dac_b_o     <= 24'h000000 ;
//    dac_c_o     <= 24'h000000 ;
//    dac_d_o     <= 24'h000000 ;
// end else begin
//    dac_a_o <= cfg;
//    dac_b_o <= cfg_b;
//    if (sys_wen) begin
//       // if (sys_addr[19:0]==16'h20)   dac_a_o <= sys_wdata[24-1: 0] ;
//       // if (sys_addr[19:0]==16'h24)   dac_b_o <= sys_wdata[24-1: 0] ;
//       if (sys_addr[19:0]==16'h28)   dac_c_o <= sys_wdata[24-1: 0] ;
//       if (sys_addr[19:0]==16'h2C)   dac_d_o <= sys_wdata[24-1: 0] ;
//    end
// end

// wire sys_en;
// assign sys_en = sys_wen | sys_ren;

// always @(posedge clk_i)
// if (rstn_i == 1'b0) begin
//    sys_err <= 1'b0 ;
//    sys_ack <= 1'b0 ;
// end else begin
//    sys_err <= 1'b0 ;
//    casez (sys_addr[19:0])
//      20'h00020 : begin sys_ack <= sys_en;         sys_rdata <= {{32-24{1'b0}}, dac_a_o}          ; end
//      20'h00024 : begin sys_ack <= sys_en;         sys_rdata <= {{32-24{1'b0}}, dac_b_o}          ; end
//      20'h00028 : begin sys_ack <= sys_en;         sys_rdata <= {{32-24{1'b0}}, dac_c_o}          ; end
//      20'h0002C : begin sys_ack <= sys_en;         sys_rdata <= {{32-24{1'b0}}, dac_d_o}          ; end
//        default : begin sys_ack <= sys_en;         sys_rdata <=   32'h0                           ; end
//    endcase
// end





//clk_i runs at 125MHz (8ns period)

//Maximum dac_sclk rate is 50MHz, 50% duty cycle (10ns high, 10ns low).
//We could use 125MHz/4=31.25MHz as the dac_sclk
//Each DAC register write takes at least 24 cycles+20ns=788ns, for dual channel, it takes 1576ns
//We could set the target slow DAC sampling rate to 488.281kHz, that gives us 2048ns to update two DAC and assert LDAC
//In 2048ns, there are 256 samples of 14bit data arriving for each dac channel. Summing these samples would give us 22bit

reg [11:0] counter;
reg [21:0] accumulator0;
reg [21:0] accumulator1;

reg [15:0] dac_data0;
reg [15:0] dac_data1;

reg [6:0] sclk_counter;

reg [1:0] state;
reg [23:0] shift_reg;

localparam 
STATE_IDLE=0,
STATE_UPDATE_A=1,
STATE_UPDATE_B=2,
STATE_LDAC=3;

reg [1:0] clk_div;
reg dac_sclk_rising;

//Generate 31.25MHz clock from 125MHz main clock
always @(posedge clk_i)
if (rstn_i == 1'b0) begin
    clk_div<=0;
    dac_sclk_rising<=0;
    end
else begin
    clk_div<=clk_div+1;
    if (clk_div>1)
        dac_sclk<=1;
    else
        dac_sclk<=0;
    if (clk_div==1)
        dac_sclk_rising<=1;
    else
        dac_sclk_rising<=0;
end

//Accumulator for averaging high speed 14bit data to 22bit.
always @(posedge clk_i)
if (rstn_i == 1'b0) begin
    accumulator0<=21'b0;
    accumulator1<=21'b0;
end else begin
    if (counter==0) begin
        
        accumulator0<=21'b0;
        accumulator1<=21'b0;
    end else begin
        accumulator0<=accumulator0+(data0_i^14'h2000);
        accumulator1<=accumulator1+(data1_i^14'h2000);
    end
end

//125MHz counter
always @(posedge clk_i)
if (rstn_i == 1'b0) begin
   counter<=11'b0;
end
else begin
    if (counter<11'd255)
        counter<=counter+11'b1;
    else
        counter<=11'b0;
end

//FSM
always @(posedge clk_i)
if (rstn_i == 1'b0) begin
    state<=STATE_IDLE;
    shift_reg<=24'd0;
    sclk_counter<=5'd0;
    dac_syncn<=1'b1;
    dac_ldacn<=1'b1;
    dac_sdin<=1'b0;
    dac_rstn<=1'b0;
    dac_data0<=16'd0;
    dac_data1<=16'd0;
end 
else begin
    dac_rstn<=1'b1;
    casez (state)
        STATE_IDLE : begin 
            if (counter==11'd0) begin
                dac_data0<=accumulator0[21:21-15];
                dac_data1<=accumulator1[21:21-15];
                state<=STATE_UPDATE_A;
                shift_reg<={4'b0010,4'b0001,accumulator0[21:21-15]};
                sclk_counter<=5'd24;
            end
            else if (counter==11'd100) begin
                state<=STATE_UPDATE_B;
                shift_reg<={4'b0010,4'b1000,dac_data1};
                sclk_counter<=5'd24;
            end
        end

        STATE_UPDATE_A : begin
            if (dac_sclk_rising==1'b1) begin
                if (sclk_counter>0) begin
                    dac_sdin<=shift_reg[23];
                    shift_reg<={shift_reg[22:0],1'b0};
                    sclk_counter<=sclk_counter-1;
                    dac_syncn<=1'b0;
                end
                else begin
                    sclk_counter<=5'd24;
                    state<=STATE_IDLE;
                    dac_syncn<=1'b1;
                end
            end
        end

        STATE_UPDATE_B : begin
            if (dac_sclk_rising==1'b1) begin
                if (sclk_counter>0) begin
                    dac_sdin<=shift_reg[23];
                    shift_reg<={shift_reg[22:0],1'b0};
                    sclk_counter<=sclk_counter-1;
                    dac_syncn<=1'b0;
                end
                else begin
                    sclk_counter<=5'd2;
                    state<=STATE_LDAC;
                    dac_syncn<=1'b1;
                end
            end
        end

        STATE_LDAC : begin
            if (dac_sclk_rising==1'b1) begin
                if (sclk_counter>0) begin
                    sclk_counter<=sclk_counter-1;
                    if (sclk_counter<5'd2) begin
                        dac_ldacn<=1'b0;
                    end
                end
                else begin
                    sclk_counter<=5'd0;
                    state<=STATE_IDLE;
                    dac_ldacn<=1'b1;
                end
            end
        end

        default : begin 
            state<=STATE_IDLE;
        end
    endcase
end

endmodule