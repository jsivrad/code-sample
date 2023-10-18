import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { useCartPage, useIsViewSmallerThan } from "@hooks";

import {
  mockCartItems,
  mockProduct,
  mockFreeShippingThreshold,
  mockGrandTotal,
} from "./mockData";

import CartPage from "./cartPage";

const mockPush = jest.fn();
const mockRenderMoney = jest.mock();

jest.mock("@utils/classify");
jest.mock("@hooks/useIsViewSmallerThan");
jest.mock("@hooks/cartPage/useCartPage");

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useHistory: () => ({
    push: mockPush,
    location: {
      hash: "",
      key: "asdfsadf",
      pathname: "/",
      search: "",
      state: undefined,
    },
  }),
}));

jest.mock("@hooks/zustand/zustandStoreConfig", () => ({
  useZustandStoreConfig: (callbackFunction) =>
    callbackFunction({
      config: {
        currencyCode: "PLN",
        locale: "pl-PL",
        callcenterConsumer: "555 222 45",
        storeName: "Polish",
      },
    }),
}));

jest.mock("@hooks/gtm/useGtmPageView", () => ({
  useGtmPageView: () => ({
    setAreMetaTagsLoaded: jest.fn(),
  }),
}));

jest.mock("../MetaTags", () => ({
  MetaTags: () => <div className="metaTags">META TAGS</div>,
}));

jest.mock("../FootnotesWrapper", () => ({
  FootnotesWrapper: () => <div>FootnotesWrapper</div>,
}));

jest.mock("../ShippingAndPaymentPartners", () => ({
  ShippingAndPaymentPartners: () => <div>ShippingAndPaymentPartners</div>,
}));

jest.mock("../NeedHelp", () => ({
  NeedHelp: () => <div>NeedHelp</div>,
}));

jest.mock(
  "../CartOrderSummaryDisclaimer/cartOrderSummaryDisclaimer",
  () => () => <div>CartOrderSummaryDisclaimer</div>
);

jest.mock("@hooks/useCouponCode", () => ({
  useCouponCode: () => ({
    siteKey: "someSiteKey",
    data: {
      cart: {
        applied_coupons: null,
        id: "someCartId",
      },
    },
    applyCouponError: "",
    appliedCouponsError: "",
    removeCouponError: "",
    handleApplyCoupon: jest.fn(),
    applyingCoupon: false,
    handleRemoveCoupon: jest.fn(),
    removingCoupon: false,
  }),
}));

jest.mock("@hooks/useToasts", () => ({
  useToasts: () => [
    {
      toasts: new Map(),
    },
    {
      addToast: jest.fn(),
      dispatch: jest.fn(),
      removeToast: jest.fn(),
    },
  ],
}));

jest.mock("@utils/gtm", () => ({
  constructL5: jest.fn(),
  constructL6: jest.fn(),
  constructL7: jest.fn(),
  constructL8: jest.fn(),
  constructProductCategory: jest.fn(),
  constructActionField: jest.fn(),
  constructLifeCycle: jest.fn(),
  constructBu: jest.fn(),
  constructSegment: jest.fn(),
  constructProductBrand: jest.fn(),
  stringWithoutSpecialCharacters: jest.fn(),
}));

jest.mock("@hooks/useStoreType", () => ({
  useStoreType: () => "public",
}));

jest.mock("@context/cart", () => {
  return {
    ...jest.requireActual("@context/cart"),
    useCartContext: jest.fn(() => [
      {
        cartId: "123",
      },
    ]),
  };
});

jest.mock("../Head", () => ({
  Title: ({ children }) => <div className="title">{children}</div>,
}));

jest.mock("@hooks/useProductListing", () => ({
  useProductListing: () => ({
    isLoading: false,
    items: mockCartItems,
    calculatedEDD: [],
    setActiveEditItem: jest.fn(),
  }),
}));

jest.mock("@hooks/usePromotionPricesMap", () => ({
  usePromotionPricesMap: () => ({
    promotionPricesMap: null,
  }),
}));

jest.mock("@hooks/useProduct", () => ({
  useProduct: () => ({
    handleRemoveFromCart: jest.fn(),
    handleUpdateItemQuantity: jest.fn(),
    product: mockProduct,
    errorMessage: "",
    updateError: null,
    cartAccessoriesData: null,
  }),
}));

jest.mock("./PriceAdjustments/CouponCodeArea/couponCodeArea", () => () => (
  <div className="couponCodeArea">couponCodeArea</div>
));

jest.mock("@hooks/usePriceSummary", () => ({
  usePriceSummary: () => ({
    hasError: false,
    hasItems: true,
    isCheckout: true,
    isLoading: false,
    flatData: {},
  }),
}));

jest.mock("@hooks/CmsBlock", () => ({
  useCmsBlock: () => ({
    cmsBlockData: () => <div className="cmsBlock">CMS BLOCK</div>,
  }),
}));

jest.mock("../VatAndFees", () => ({
  VatAndFees: () => <div>VAT incl.</div>,
}));

const setup = ({
  isMobile = false,
  cartItems = mockCartItems,
  hasItems = true,
  shouldShowLoadingIndicator = false,
  grandTotal = mockGrandTotal,
  freeShippingThreshold = mockFreeShippingThreshold,
}) => {
  useIsViewSmallerThan.mockReturnValue(isMobile);
  useCartPage.mockReturnValue({
    cartItems,
    hasItems,
    isCartUpdating: false,
    setIsCartUpdating: jest.fn(),
    shouldShowLoadingIndicator,
    grandTotal: grandTotal,
    freeShippingThreshold,
    renderMoney: mockRenderMoney,
  });

  render(
    <BrowserRouter>
      <CartPage />
    </BrowserRouter>
  );
};

describe("<CartPage />", () => {
  it("Should render and redirect back to the shop", () => {
    setup({});

    expect(
      document.documentElement.getElementsByClassName("root")[0]
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Continue Shopping").closest("a")
    ).toBeInTheDocument();

    expect(
      document.documentElement
        .getElementsByClassName("itemsContainer")[0]
        .getElementsByTagName("li").length
    ).toBe(mockCartItems.length);

    expect(
      document.documentElement.getElementsByClassName("checkoutButton")[0]
    ).toBeInTheDocument();

    fireEvent.click(screen.queryByText("Continue Shopping").closest("a"));
    expect(window.location.pathname).toBe("/");
  });

  it("Should render and redirect to a product page", () => {
    setup({});

    expect(
      document.documentElement.getElementsByClassName("root")[0]
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Continue Shopping").closest("a")
    ).toBeInTheDocument();

    expect(
      document.documentElement
        .getElementsByClassName("itemsContainer")[0]
        .getElementsByTagName("li").length
    ).toBe(mockCartItems.length);

    expect(
      document.documentElement
        .getElementsByClassName("itemsContainer")[0]
        .getElementsByTagName("li")[0]
        .getElementsByTagName("a")[0]
    ).toBeInTheDocument();
    fireEvent.click(
      document.documentElement
        .getElementsByClassName("itemsContainer")[0]
        .getElementsByTagName("li")[0]
        .getElementsByTagName("a")[0]
    );

    expect(window.location.pathname).toContain(
      mockCartItems[0]?.product?.url_key
    );
  });

  it("Should render no results", () => {
    setup({
      cartItems: [],
      hasItems: false,
      grandTotal: {
        currency: "PLN",
        value: 0,
      },
    });

    expect(
      document.documentElement.getElementsByClassName("root")[0]
    ).toBeInTheDocument();
    expect(
      document.documentElement.getElementsByClassName("emptyBasket")[0]
    ).toBeInTheDocument();
    expect(
      document.documentElement.getElementsByClassName("checkoutButton")[0]
    ).not.toBeDefined();

    expect(screen.queryByText("Homepage").closest("a")).toBeInTheDocument();

    fireEvent.click(screen.queryByText("Homepage").closest("a"));
    expect(window.location.pathname).toBe("/");
  });
});
