import React, { useState, useMemo } from "react";
import { shape, string } from "prop-types";
import qs from "qs";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { useHistory } from "react-router-dom";

import {
  useCartPage,
  useStockStatusMessage,
  useIsViewSmallerThan,
  BP,
  useGtmPageView,
  useStoreType,
  useConstructMetaTagList,
  useNewRelicPageGroup,
  useZustandStoreConfig,
} from "@hooks";
import { Button, ErrorBar, Link, Typography } from "@ui/core";
import { ArrowLeft } from "@ui/icons";
import { mergeClasses } from "@utils/classify";
import { ROUTE } from "@constants";

import { Title } from "../Head";
import { FootnotesWrapper } from "../FootnotesWrapper";
import { CartOrderSummaryDisclaimer } from "../CartOrderSummaryDisclaimer";
import { NeedHelp } from "../NeedHelp";
import { ShippingAndPaymentPartners } from "../ShippingAndPaymentPartners";
import { FullPageLoader } from "../FullPageLoader";
import { FreeShippingBanner } from "../CartCheckoutHeader/FreeShippingBanner";
import { MetaTags } from "../MetaTags";
import { CartMobileFooter } from "./CartMobileFooter";
import { OrderSummary } from "./OrderSummary";
import { ProductListing } from "./ProductListing";
import { EmptyCart } from "./EmptyCart";

import defaultClasses from "./cartPage.module.css";

const CartPage = ({ classes: propsClasses }) => {
  const { formatMessage } = useIntl();
  const { push, location } = useHistory();

  const viewUnderCustomMedium = useIsViewSmallerThan(BP.medium);

  const currencyCode = useZustandStoreConfig(
    (state) => state?.config?.currencyCode
  );
  const locale = useZustandStoreConfig((state) => state?.config?.locale);
  const callcenterConsumer = useZustandStoreConfig(
    (state) => state?.config?.callcenterConsumer
  );
  const storeName = useZustandStoreConfig((state) => state?.config?.storeName);

  const [appliedVouchers, setAppliedVouchers] = useState([]);

  // base64 error message ?error=sdfjhgsdjfh
  const { error } = qs.parse(location.search, {
    ignoreQueryPrefix: true,
  });

  const {
    cartItems,
    hasItems,
    isCartUpdating,
    setIsCartUpdating,
    shouldShowLoadingIndicator,
    grandTotal,
    freeShippingThreshold,
    renderMoney,
    couponsMap,
  } = useCartPage();

  const storeType = useStoreType();

  const constructedCartItems = useMemo(() => {
    return cartItems.map(({ product, ...restProps }) => ({
      ...product,
      ...restProps,
    }));
  }, [cartItems]);

  const { setAreMetaTagsLoaded } = useGtmPageView({
    list: "view cart",
    pageNameL5: "cart",
    pageNameL8: "cart",
    products: constructedCartItems,
    conditional: !isCartUpdating,
    couponsMap,
  });

  const metaTagList = useConstructMetaTagList({
    pageLevel: "cart",
    simpleTitle: "cart",
    bu: "shared",
    segment: "segment neutral",
    lifeCycle: "buy.cart",
    otherTags: [
      {
        name: "store_type",
        content: storeType,
      },
    ],
  });

  useNewRelicPageGroup("cart");

  const { hasOutOfStockItem } = useStockStatusMessage({ cartItems });

  const classes = mergeClasses(defaultClasses, propsClasses);

  if (shouldShowLoadingIndicator) {
    return <FullPageLoader />;
  }

  const itemsTranslation =
    cartItems.length > 1
      ? formatMessage(
          {
            id: "Cart.Title.NotEmpty",
            defaultMessage: "{itemsAmount} items",
          },
          { itemsAmount: cartItems.length }
        )
      : formatMessage({
          id: "Cart.Title.NotEmpty.Single",
          defaultMessage: "1 item",
        });

  const title = formatMessage({
    id: "Cart.Title",
    defaultMessage: "Your Basket",
  });

  const emptyCartTitle = formatMessage({
    id: "Cart.Title.Empty",
    defaultMessage: "is Empty",
  });

  const cartHeading = hasItems ? (
    <>
      <Typography
        className={classes.cartHeading}
        tag="h1"
        variant="titleL"
        isCaps
      >
        {title}
      </Typography>
      <Typography className={classes.itemCount} variant="bodyS" isCaps>
        {itemsTranslation}
      </Typography>
    </>
  ) : (
    <Typography
      tag="h1"
      variant="boldXL"
      isCaps
      data-test-hook="@ui/cart-empty-title"
    >
      {`${title} ${emptyCartTitle}`}
    </Typography>
  );

  const productListing = hasItems ? (
    <ProductListing
      setIsCartUpdating={setIsCartUpdating}
      appliedVouchers={appliedVouchers}
      itemsCount={cartItems.length}
    />
  ) : (
    <EmptyCart />
  );

  const bannerSection = viewUnderCustomMedium ? (
    <FreeShippingBanner
      hasItems={hasItems}
      freeShippingThreshold={freeShippingThreshold}
      renderMoney={renderMoney}
      priceSize="tiny"
    />
  ) : null;

  const orderSummary = hasItems ? (
    <OrderSummary
      setIsCartUpdating={setIsCartUpdating}
      isCartUpdating={isCartUpdating}
      cartItems={cartItems}
      setAppliedVouchers={setAppliedVouchers}
      isDesktop={!viewUnderCustomMedium}
    />
  ) : null;

  const cartError = (
    <div className={classes.error}>
      <ErrorBar
        title={formatMessage({
          id: "Error.CouldNotPlaceOrder",
          defaultMessage: "We could not place your order",
        })}
        description={error}
        isVisible={!!error}
      />
    </div>
  );

  const aboveSummaryError = (
    <div className={classes.aboveSummaryError}>
      <Typography
        className={classes.aboveSummaryErrorTitle}
        variant="titleS"
        tag="h3"
      >
        {formatMessage({
          id: "Error.CouldNotPlaceOrder",
          defaultMessage: "We could not place your order",
        })}
      </Typography>
      <Typography>
        {formatMessage({
          id: "Cart.Error.CustomerService",
          defaultMessage: "Customer Service",
        })}
        {": "}
        <Link
          to={`tel:${callcenterConsumer}`}
          dense
          variation="inText"
          dataTestHook="@ui/cart-error-customer-support"
        >
          {callcenterConsumer}
        </Link>
      </Typography>
    </div>
  );

  const pageTitle = formatMessage({
    id: "PageTitle.Cart",
    defaultMessage: "Cart",
  });

  return (
    <>
      <MetaTags
        tagList={metaTagList}
        tagsLoadedCallback={setAreMetaTagsLoaded}
      />
      {!viewUnderCustomMedium && cartError}
      <div className={classes.root}>
        <Title>{`${pageTitle} - ${storeName}`}</Title>

        <div className={classes.contentWrapper}>
          <div className={classes.backToStore}>
            <span>
              <Button
                startIcon={<ArrowLeft size="s" />}
                variation="tertiary"
                to="/"
              >
                {formatMessage({
                  id: "Cart.ContinueShopping",
                  defaultMessage: "Continue Shopping",
                })}
              </Button>
            </span>
          </div>
          {viewUnderCustomMedium && cartError}
          {bannerSection}
          <div className={classes.content}>
            <div
              className={clsx(
                classes.contentHeader,
                !hasItems && classes.emptyCartHeader
              )}
              data-test-hook="@ui/cart-header"
            >
              {cartHeading}
            </div>
            <div className={classes.itemsContainer}>{productListing}</div>
          </div>
          {viewUnderCustomMedium ? (
            <CartMobileFooter
              total={grandTotal}
              locale={locale}
              currencyCode={currencyCode}
              hasItems={hasItems}
            />
          ) : null}
          {!viewUnderCustomMedium && hasItems ? (
            <Button
              className={classes.checkoutButton}
              onClick={() => push(ROUTE.CHECKOUT)}
              dataTestHook="cart-to-checkout"
              disabled={hasOutOfStockItem}
            >
              {formatMessage({
                id: "Cart.CheckoutButtonLabel",
                defaultMessage: "Checkout Securely",
              })}
            </Button>
          ) : null}
        </div>
        <div className={classes.summaryContainer}>
          {!!error && aboveSummaryError}
          {orderSummary}
          <div className={classes.orderDisclaimer}>
            <CartOrderSummaryDisclaimer isDesktop={!viewUnderCustomMedium} />
          </div>
          <div className={classes.shoppingInformation}>
            <NeedHelp />
            <ShippingAndPaymentPartners dynamicUpdate />
          </div>
        </div>
      </div>
      <FootnotesWrapper
        name={formatMessage({
          id: "Footnotes",
          defaultMessage: "Footnotes",
        })}
        staticBlockId="checkout_footnotes"
        legalFootnotes
      />
    </>
  );
};

CartPage.propTypes = {
  classes: shape({
    itemCount: string,
    error: string,
    aboveSummaryError: string,
    root: string,
    contentWrapper: string,
    backToStore: string,
    content: string,
    contentHeader: string,
    emptyCartHeader: string,
    itemsContainer: string,
    checkoutButton: string,
    summaryContainer: string,
    orderDisclaimer: string,
    shoppingInformation: string,
  }),
};

export default CartPage;
